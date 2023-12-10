import React from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import "../css/main.css"
import styles from "../css/register.module.css"
import Virus from "../components/Virus"
import fish from "../img/fish.svg"
import RegisterWindow from "../components/RegisterWindow"
import Modal from "../components/Modal"


class Register extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            account: {
                name: "",
                email: '',
            },
            modal: {
                modalActive: false,
                modalText: "",
            }
        }

        // this.addSite = this.addSite.bind(this)
        // this.openSiteAddPage = this.openSiteAddPage.bind(this)
        // this.closeSiteAddPage = this.closeSiteAddPage.bind(this)
        // this.deleteUser = this.deleteUser.bind(this)
        // this.editUser = this.editUser.bind(this)
        this.setModalActive = this.setModalActive.bind(this)
    }


    render() {
        return (
            <div>
                <Header display="inline-block" title="FishHunter" />
                <div className={styles.registerContainer}>
                    <div className={styles.registerZone}>
                        <Virus height="18rem" width="18rem" right="-7rem" top="-7rem" rotate_degree={0.5} fill="#ADE0DF"></Virus>
                        <Virus height="15rem" width="15rem" left="-7rem" bottom="-7rem" rotate_degree={-1} fill="#3A506B"></Virus>
                        <div className={styles.registerFrame}>
                            <RegisterWindow width="40%" setModalActive={this.setModalActive}></RegisterWindow>
                            <div className={styles.registerImage}>
                                <img src={fish} className={styles.registerFish} alt="" />
                            </div>

                        </div>
                    </div>
                </div>

                <Footer></Footer>
                <Modal active={this.state.modal.modalActive} setActive={this.setModalActive}>
                    <p style={{ fontWeight: "400" }}>{this.state.modal.modalText}</p>
                </Modal>
            </div>
        )
    }

    setModalActive(condition, text = '') {
        if (text != '') {
            this.setState((prevState) => ({
                modal: {
                    ...prevState.modal,
                    ["modalActive"]: condition,
                    ["modalText"]: text,
                },
            }));
        }
        else {
            this.setState((prevState) => ({
                modal: {
                    ...prevState.modal,
                    ["modalActive"]: condition,
                },
            }));
        }


        // this.setState({modal: {...this.state.modal, ["modalActive"]: condition}})
    }

}

export default Register