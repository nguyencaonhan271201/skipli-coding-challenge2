import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom";

export const FormPage: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [accessCode, setAccessCode] = useState<string>("");
  const [isHandling, setIsHandling] = useState<boolean>(false);

  // Hooks
  // Reset the logged in state (phoneNumber in localStorage)
  useEffect(() => {
    localStorage.removeItem("phoneNumber")
  }, [])

  // Helper functions
  const getAccessCode = async (e: any) => {
    e.preventDefault()

    if (phoneNumber === "") {
      alert("Please input your phone number");
      return null;
    }

    setIsHandling(true);
    await axios.post(`${process.env.REACT_APP_API_URL}/CreateNewAccessCode`, {
      phoneNumber: phoneNumber
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    })
      .then(response => {
        alert(response?.data?.message)
        setIsHandling(false);
      }, error => {
        alert(error.response?.data?.message)
        setIsHandling(false);
      })
  }

  const performSave = async (e: any) => {
    e.preventDefault();

    if (phoneNumber === "") {
      alert("Please input your phone number");
      return null;
    }

    if (accessCode === "") {
      alert("Please input your access code");
      return null;
    }

    setIsHandling(true);
    await axios.post(`${process.env.REACT_APP_API_URL}/ValidateAccessCode`, {
      phoneNumber: phoneNumber,
      accessCode: accessCode
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    })
      .then(response => {
        if (response?.data?.success) {
          localStorage.setItem("phoneNumber", phoneNumber);
          navigate("/search")
        }
      }, error => {
        alert(error.response?.data?.message)
        setIsHandling(false);
      })
  }

  return (
    <div className="form-page">
      <form>
        <div>
          <label htmlFor="phone-number">
            Phone number&nbsp;
          </label>
          <input
            id="phone-number"
            name="phone-number"
            placeholder="Phone number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isHandling}
          ></input>
        </div>
        <div>
          <label htmlFor="access-code">
            Access code&nbsp;
          </label>
          <input
            id="access-code"
            name="access-code"
            placeholder="Access code"
            type="number"
            maxLength={6}
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            disabled={isHandling}
          ></input>
        </div>
        <div>
          <button
            role="button"
            onClick={(e) => getAccessCode(e)}
            disabled={isHandling}>
            Get Access Code
          </button>
          <button
            role="button"
            onClick={(e) => performSave(e)}
            disabled={isHandling}>
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
