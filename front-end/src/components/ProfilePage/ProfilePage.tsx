import './ProfilePage.scss'
import axios from "axios";
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export const ProfilePage: React.FC = () => {
  // Libraries
  const navigate = useNavigate();

  // States
  const [likedProfiles, setLikedProfiles] = useState<Array<any>>([]);

  // Hooks
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
        const likeProfileIDs = response?.data?.favorite_github_users
        getLikedProfiles(Object.keys(likeProfileIDs).map(function (key) { return likeProfileIDs[key] }))
      }, error => {
        alert(error.response?.data?.message)
      })
  }, [])

  // Helper functions
  const getLikedProfiles = (likeProfileIDs: Array<number>) => {
    let url = `${process.env.REACT_APP_API_URL}/findMultipleGithubUserProfile?`
    likeProfileIDs.forEach((profileID) => {
      url += `github_user_id[]=${profileID}&`
    })
    url = url.substring(0, url.length - 1);

    axios.get(url,
      {
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      })
      .then(response => {
        const likedProfiles = response?.data;
        setLikedProfiles(Object.keys(likedProfiles).map(function (key) { return likedProfiles[key] }))
      }, error => {
        alert(error.response?.data?.message)
      })
  }

  return (
    <div className="profile-page">
      <h3>Phone number: {localStorage.getItem("phoneNumber")}</h3>

      {likedProfiles?.length > 0
        && <div className="profile-page__results" style={{ marginBottom: 30 }}>
          <table cellPadding={10} cellSpacing={0}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Login</th>
                <th>Avatar_URL</th>
                <th>HTML_URL</th>
                <th>Public Repos</th>
                <th>Followers</th>
              </tr>
            </thead>

            <tbody>
              {likedProfiles.map((result, index) => (
                <tr key={`result-${index}`}>
                  <td>{result?.id}</td>
                  <td>{result?.login}</td>
                  <td><a href={result?.avatar_url}>{result?.avatar_url}</a></td>
                  <td><a href={result?.html_url}>{result?.html_url}</a></td>
                  <td><a href={result?.public_repos}>{result?.public_repos}</a></td>
                  <td><a href={result?.followers}>{result?.followers}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
    </div>
  )
}
