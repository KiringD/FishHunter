import React from "react"
import { createRoot } from 'react-dom/client';
import { Fragment } from 'react'
import { Link, Outlet } from 'react-router-dom';
import "../css/main.css"
import styles from "../css/register.module.css"
import platformStyles from "../css/platform.module.css"
import axios from 'axios';

class RegisterWindow extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            emailError: false,
            passwordError: false,
            passwordConfirmError: false,
        }
        this.isValidPassword = this.isValidPassword.bind(this)
        this.isValidEmail = this.isValidEmail.bind(this)
        this.isValidPasswordConfirm = this.isValidPasswordConfirm.bind(this)
    }

    render() {
        return (
            <div style={{ width: this.props.width }} className={styles.registerForm}>
                <div className={styles.registerTitle}>Регистрация</div>
                <div className={styles.registerFields}>
                    <input type="text" placeholder="Имя" className={styles.registerInput}></input>
                    <input type="email" placeholder="Email" className={styles.registerInput} onChange={this.isValidEmail}></input>
                    <p id="emailTag" style={{ display: "none", color: "red", marginTop: "0.3rem", fontSize: "0.8rem" }}>Неверный email адрес</p>
                    <input type="password" placeholder="Пароль" id="password" className={styles.registerInput} onChange={this.isValidPassword}></input>
                    <p id="passwordTag" style={{ display: "none", color: "red", marginTop: "0.3rem", fontSize: "0.8rem" }}>Пароль должен быть минимум 8 символов</p>
                    <input type="password" placeholder="Подтвердите пароль" id="passwordConfirm" className={styles.registerInput} onChange={this.isValidPasswordConfirm}></input>
                    <p id="passwordConfirmTag" style={{ display: "none", color: "red", marginTop: "0.3rem", fontSize: "0.8rem" }}>Пароли должны совпадать</p>
                </div>
                <button className={`${platformStyles.addButton} ${platformStyles.buttonMimas} ${styles.registerButton}`} onClick={() => this.onRegister()} role="button"><span>Создать аккаунт</span></button>
                <Link to='/login' className={styles.additionOption}>Уже есть аккаунт?</Link>
            </div>
        )
    }

    onRegister() {
        // this.props.setModalActive(true, "Укажите ссылку на сайт для отслеживания")
        let inputs = document.getElementsByClassName(styles.registerInput)
        if (inputs[0].value != "" && inputs[1].value != "" && inputs[2].value != "" && inputs[3].value != "") {
            if (!this.state.emailError && !this.state.passwordError && !this.state.passwordConfirmError) {
                const data = { "action": "register", "data": { "name": inputs[0].value, "email": inputs[1].value.toLowerCase(), "password": inputs[2].value } }
                axios.put('http://api.kiringspace.ru/api/upload', data, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then(response => {
                        console.log('Response:', response.data);
                        if (response.data.code == "0") {
                            inputs[0].value = ""
                            inputs[1].value = ""
                            inputs[2].value = ""
                            inputs[3].value = ""
                            this.props.setModalActive(true, "Аккаунт успешно создан")
                        }
                        else {
                            this.props.setModalActive(true, response.data.message)
                        }
                        // this.setState({image: response.data.message})
                        // Обработайте ответ по вашему усмотрению
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        // this.props.setModalActive(true, error)
                        // Обработайте ошибку по вашему усмотрению
                    });
            }
        }
        else {
            this.props.setModalActive(true, "Заполните все поля")
        }
    }

    isValidEmail = (event) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        var result = emailRegex.test(event.target.value)
        if (result || event.target.value === "") {
            if (this.state.emailError) {
                event.target.style.border = ""
                event.target.style.marginBottom = ''
                const tag = event.target.nextSibling;
                tag.style.display = "none"

                this.setState({ emailError: false })
            }
        }
        else {
            if (!this.state.emailError) {
                event.target.style.border = '1px solid red'
                event.target.style.marginBottom = '0'
                const tag = event.target.nextSibling;
                tag.style.display = "inline"

                this.setState({ emailError: true })
            }
        }
    }

    isValidPassword = (event) => {
        const passwordRegex = /^[a-zA-Z0-9._%+-]{8,}$/
        var result = passwordRegex.test(event.target.value)
        const passwordConfirm = document.getElementById('passwordConfirm')
        if (passwordConfirm.value != "" && event.target.value != passwordConfirm.value) {
            passwordConfirm.nextSibling.style.display = "inline"
            passwordConfirm.style.border = '1px solid red'
            passwordConfirm.style.marginBottom = '0'
            this.setState({ passwordConfirmError: true })
        }
        else if (passwordConfirm.value != "" && event.target.value == passwordConfirm.value) {
            passwordConfirm.nextSibling.style.display = "none"
            passwordConfirm.style.border = ""
            passwordConfirm.style.marginBottom = ''
            this.setState({ passwordConfirmError: false })
        }
        if (result || event.target.value === "") {
            if (this.state.passwordError) {
                event.target.style.border = ""
                event.target.style.marginBottom = ''
                const tag = event.target.nextSibling;
                tag.style.display = "none"

                this.setState({ passwordError: false })
            }
        }
        else {
            if (!this.state.passwordError) {
                event.target.style.border = '1px solid red'
                event.target.style.marginBottom = '0'
                const tag = event.target.nextSibling;
                tag.style.display = "inline"

                this.setState({ passwordError: true })
            }
        }
    }

    isValidPasswordConfirm = (event) => {
        var result = event.target.value == document.getElementById('password').value
        if (result || event.target.value === "") {
            if (this.state.passwordConfirmError) {
                event.target.style.border = ""
                event.target.style.marginBottom = ''
                const tag = event.target.nextSibling;
                tag.style.display = "none"

                this.setState({ passwordConfirmError: false })
            }
        }
        else {
            if (!this.state.passwordConfirmError) {
                event.target.style.border = '1px solid red'
                event.target.style.marginBottom = '0'
                const tag = event.target.nextSibling;
                tag.style.display = "inline"

                this.setState({ passwordConfirmError: true })
            }
        }
    }


}

export default RegisterWindow