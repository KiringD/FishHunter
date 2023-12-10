import React, { useState } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import "../css/main.css"
import styles from "../css/register.module.css"
import Virus from "../components/Virus"
import fish from "../img/fish.svg"
import LoginWindow from "../components/LoginWindow"
import Modal from "../components/Modal"


const Login = () => {
    const [modal, setModal] = useState({
        modalActive: false,
        modalText: "",
    })

    return (
        <div>
            <Header display="inline-block" title="FishHunter" />
            <div className={styles.registerContainer}>
                <div className={styles.loginZone}>
                    <Virus height="18rem" width="18rem" right="-7rem" top="-7rem" rotate_degree={0.5} fill="#ADE0DF"></Virus>
                    <Virus height="15rem" width="15rem" left="-7rem" bottom="-7rem" rotate_degree={-1} fill="#3A506B"></Virus>
                    <div className={styles.registerFrame}>
                        <LoginWindow setModalActive={setModalActive}></LoginWindow>
                    </div>
                </div>
            </div>
            <Footer></Footer>
            <Modal active={modal.modalActive} setActive={setModalActive}>
                <p style={{ fontWeight: "400" }}>{modal.modalText}</p>
            </Modal>
        </div>
    )

    function setModalActive(condition, text = '') {
        if (text != '') {
            setModal(prevModal => ({
                ...prevModal,
                modalActive: condition,
                modalText: text,
            }));

        }
        else {
            setModal(prevModal => ({
                ...prevModal,
                modalActive: condition,
            }));
        }
    }



}

export default Login