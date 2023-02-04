import './SearchPage.scss'
import React, { useState, useEffect, useCallback } from "react"
import ProfileImage from "./../../assets/Profile.png"
import { debounce } from "lodash"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export const SearchPage: React.FC = () => {
  // Libraries
  const navigate = useNavigate();

  // States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFetchingResults, setIsFetchingResults] = useState<boolean>(false);
  const [results, setResults] = useState<Array<any>>([]);
  const [likedProfiles, setLikedProfiles] = useState<Array<number>>([]);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numberOfPages, setNumberOfPages] = useState<number>(1);

  // On page load
  useEffect(() => {
    // Do not display this page if not signed in
    if (!localStorage.getItem("phoneNumber")) {
      navigate("/")
      return
    }

    // Get list of liked profiles
    axios.get(`${process.env.REACT_APP_API_URL}/getUserProfile?phone_number=${localStorage.getItem("phoneNumber")}`,
      {
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      })
      .then(response => {
        const listOfUsers = response?.data?.favorite_github_users
        setLikedProfiles(Object.keys(listOfUsers).map(function (key) { return listOfUsers[key] }));
      }, error => {
        alert(error.response?.data?.message)
      })
  }, [])

  // Handle search
  const fetchResults = async (query: string) => {
    setIsFetchingResults(true);
    const url = `${process.env.REACT_APP_API_URL}/searchGithubUsers?q=${encodeURIComponent(query)}&page=${currentPage}&per_page=${itemsPerPage}`
    await axios.get(url, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    })
      .then(response => {
        setResults(response?.data?.items)

        const numberOfItems = response?.data?.total_count;
        const newNumberOfPages = Math.floor(numberOfItems / itemsPerPage) === numberOfItems / itemsPerPage ?
          Math.floor(numberOfItems / itemsPerPage) : Math.floor(numberOfItems / itemsPerPage) + 1

        if (numberOfPages !== newNumberOfPages) {
          setNumberOfPages(newNumberOfPages);
        }

        if (currentPage > newNumberOfPages) {
          setCurrentPage(1)
        }

        setIsFetchingResults(false);
      }, error => {
        alert(error.response?.data?.message)
        setIsFetchingResults(false);
      })
  }

  const debounceFetchResult = useCallback(
    debounce((query) => fetchResults(query), 500), []);

  useEffect(() => {
    if (searchQuery !== "") {
      setIsFetchingResults(true);
      debounceFetchResult(searchQuery);
    } else {
      setResults([]);
      setIsFetchingResults(false);
    }
  }, [searchQuery]);

  // Handle like profile
  const updateLikeProfile = async (id: number) => {
    let getLikedProfiles = [...likedProfiles];
    let isLike = false;

    if (getLikedProfiles.includes(id)) {
      getLikedProfiles.splice(getLikedProfiles.indexOf(id), 1)
      isLike = false
    } else {
      getLikedProfiles.push(id)
      isLike = true
    }

    setLikedProfiles(getLikedProfiles);

    // Send info to server
    await axios.post(`${process.env.REACT_APP_API_URL}/likeGithubUser`, {
      phone_number: localStorage.getItem("phoneNumber"),
      github_user_id: id,
      is_like: isLike
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    })
      .then(response => {
      }, error => {
        alert(error.response?.data?.message)
      })
  }

  // Handle pagination
  const renderPagination = () => {
    let itemsToShow = [
      {
        label: "<<",
        isDisabled: currentPage === 1,
        newPage: 1,
        pageValue: null
      },
      {
        label: "<",
        isDisabled: currentPage === 1,
        newPage: currentPage - 1,
        pageValue: null
      },
      {
        label: ">",
        isDisabled: currentPage === numberOfPages,
        newPage: currentPage + 1,
        pageValue: null
      },
      {
        label: ">>",
        isDisabled: currentPage === numberOfPages,
        newPage: numberOfPages,
        pageValue: null
      },
    ] as Array<{
      label: string;
      isDisabled: boolean;
      newPage: number;
      pageValue: number | null
    }>;

    if (currentPage <= 3) {
      for (let i = 1; i <= Math.min(3, numberOfPages); i++) {
        itemsToShow.splice(1 + i, 0, {
          label: `${i}`,
          isDisabled: i === currentPage,
          newPage: i,
          pageValue: i
        })
      }

      if (numberOfPages > 3) {
        itemsToShow.splice(itemsToShow.length - 2, 0, {
          label: `...`,
          isDisabled: true,
          newPage: currentPage,
          pageValue: null
        }, {
          label: `${numberOfPages}`,
          isDisabled: false,
          newPage: numberOfPages,
          pageValue: numberOfPages
        })
      }
    } else if (currentPage >= numberOfPages - 2) {
      if (numberOfPages - 2 > 1) {
        itemsToShow.splice(itemsToShow.length - 2, 0, {
          label: `1`,
          isDisabled: false,
          newPage: 1,
          pageValue: 1
        }, {
          label: `...`,
          isDisabled: true,
          newPage: 1,
          pageValue: null
        })
      }

      for (let i = Math.max(1, numberOfPages - 2); i <= numberOfPages; i++) {
        itemsToShow.splice(itemsToShow.length - 2, 0, {
          label: `${i}`,
          isDisabled: i === currentPage,
          newPage: i,
          pageValue: i
        })
      }
    } else {
      itemsToShow.splice(2, 0, {
        label: `1`,
        isDisabled: false,
        newPage: 1,
        pageValue: 1
      }, {
        label: `...`,
        isDisabled: true,
        newPage: 1,
        pageValue: null
      })

      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        itemsToShow.splice(4 + (i - currentPage + 1), 0, {
          label: `${i}`,
          isDisabled: i === currentPage,
          newPage: i,
          pageValue: i
        })
      }

      itemsToShow.splice(itemsToShow.length - 2, 0, {
        label: `...`,
        isDisabled: true,
        newPage: currentPage,
        pageValue: null
      }, {
        label: `${numberOfPages}`,
        isDisabled: false,
        newPage: numberOfPages,
        pageValue: numberOfPages
      })
    }

    return (
      <span className='search-page__pagination'>
        {itemsToShow.map((option, index) => (
          <span
            className={`search-page__pagination--option 
              ${option.isDisabled && "search-page__pagination--disabled"}
              ${option.pageValue === currentPage && "search-page__pagination--selected"}`}
            onClick={() => {
              if (!option.isDisabled) {
                setCurrentPage(option.newPage)
              }
            }}>{option.label}</span>
        ))}
      </span>
    )
  }

  // Handle page changed or options changed
  useEffect(() => {
    fetchResults(searchQuery);
  }, [currentPage, itemsPerPage])

  return (
    <div className="search-page">
      <div className="search-page__navbar">
        <input
          type="text"
          name="search"
          value={searchQuery}
          className='search-page__navbar--search-bar'
          placeholder='Search...'
          onChange={(e) => setSearchQuery(e.target.value)} />

        <img
          className='search-page__navbar--profile-icon'
          src={ProfileImage}
          onClick={() => {
            navigate("/profile")
          }} />
      </div>

      {!isFetchingResults && results?.length > 0
        && <div className="search-page__results" style={{ marginBottom: 30 }}>
          <table cellPadding={10} cellSpacing={0}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Login</th>
                <th>Avatar_URL</th>
                <th>HTML_URL</th>
                <th>Public Repos</th>
                <th>Followers</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {results.map((result, index) => (
                <tr key={`result-${index}`}>
                  <td>{result?.id}</td>
                  <td>{result?.login}</td>
                  <td><a href={result?.avatar_url}>{result?.avatar_url}</a></td>
                  <td><a href={result?.html_url}>{result?.html_url}</a></td>
                  <td><a href={result?.repos_url}>{result?.repos_url}</a></td>
                  <td><a href={result?.followers_url}>{result?.followers_url}</a></td>
                  <td>
                    <FontAwesomeIcon
                      icon={faHeart}
                      className="search-page__results--icon-like"
                      onClick={() => updateLikeProfile(result?.id)}
                      style={likedProfiles.includes(result?.id) ?
                        { color: "red" } :
                        { color: "black" }
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='search-page__results--options'>
            <span>
              Items per page&nbsp;
              <select
                value={itemsPerPage}
                onChange={e => setItemsPerPage(parseInt(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
            </span>

            {renderPagination()}
          </div>
        </div>}
    </div>
  )
}
