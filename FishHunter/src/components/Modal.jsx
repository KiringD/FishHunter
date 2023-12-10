import React from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Virus from "../components/Virus"
import "../css/main.css"
import styles from "../css/modal.module.css"
import EmptySiteElement from "../components/EmptySiteElement"
import SiteElement from "../components/SiteElement"

class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <div className={this.props.active ? `${styles.modal} ${styles.active}` : styles.modal} onClick={() => this.props.setActive(false)}>
                <div className={this.props.active ? `${styles.modal_container} ${styles.active}` : styles.modal_container} onClick={e => e.stopPropagation()} >
                    {this.props.children}
                </div>
            </div>
        )
    }

}

export default Modal