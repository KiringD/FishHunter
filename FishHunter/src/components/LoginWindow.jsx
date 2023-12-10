import React, { useState } from "react"
import "../css/main.css"
import styles from "../css/register.module.css"
import platformStyles from "../css/platform.module.css"
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const LoginWindow = (props) => {
    const [emailError, setEmailError] = useState(false);
    const [emailValue, setEmailValue] = useState("");
    const [passwordValue, setPasswordValue] = useState("");

    const navigate = useNavigate()

    return (
        <div className={styles.loginForm}>
            <div className={styles.registerTitle}>Вход</div>
            <div className={styles.registerFields}>
                <input type="email" placeholder="Email" className={styles.registerInput} onChange={isValidEmail}></input>
                <p id="emailTag" style={{ display: "none", color: "red", marginTop: "0.3rem", fontSize: "0.8rem" }}>Неверный email адрес</p>
                <input type="password" placeholder="Пароль" className={styles.registerInput} onChange={(e) => setPasswordValue(e.target.value)}></input>
            </div>
            <button className={`${platformStyles.addButton} ${platformStyles.buttonMimas} ${styles.registerButton}`} onClick={onLoginButton} role="button"><span>Войти в аккаунт</span></button>
            <div className={styles.additionOption}>Забыли пароль?</div>
        </div>
    )

    function isValidEmail(event) {
        setEmailValue(event.target.value)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        var result = emailRegex.test(event.target.value)
        if (result || event.target.value === "") {
            if (emailError) {
                event.target.style.border = ""
                event.target.style.marginBottom = ''
                const tag = event.target.nextSibling;
                tag.style.display = "none"

                setEmailError(false)
            }
        }
        else {
            if (!emailError) {
                event.target.style.border = '1px solid red'
                event.target.style.marginBottom = '0'
                const tag = event.target.nextSibling;
                tag.style.display = "inline"

                setEmailError(true)
            }
        }
    }

    function onLoginButton() {
        if (emailValue != "" && passwordValue != "" && !emailError) {
            const data = { "action": "login", "data": { "login": emailValue, "password": passwordValue } }
            axios.put('http://api.kiringspace.ru/api/upload', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => {
                    console.log('Response:', response.data)
                    const token = response.data.token
                    localStorage.setItem("token", token)
                    navigate("/platform")
                })
                .catch(error => {
                    console.error('Error:', error);
                    props.setModalActive(true, error.response.data)

                });
        }
    }


}

export default LoginWindow