import React, { useEffect, useState } from "react"
import { Link, Outlet, useNavigate } from 'react-router-dom';


const Header = (props) => {
  const [isLogged, setIsLogged] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLogged(true)
    }
  }, []);

  return (
    <header className="header">
      <Link to='/' className="headerTitle">{props.title}</Link>
      <div>
        <Link to='/login' style={{ display: isLogged ? "none" : "inline-block" }} className="headerButton">Войти</Link>
        <Link to='/register' style={{ display: isLogged ? "none" : "inline-block" }} className="headerButton">Зарегистрироваться</Link>
        <div style={{ display: isLogged ? "inline-block" : "none" }} onClick={onLogout} className="headerButton">Выйти</div>
      </div>

      <Outlet />
    </header>
  )

  function onLogout() {
    localStorage.removeItem("token");
    setIsLogged(false)
    navigate("/")

  }

}

export default Header