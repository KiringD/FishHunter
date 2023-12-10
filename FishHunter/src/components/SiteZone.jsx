import React from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Virus from "../components/Virus"
import styles from "../css/platform.module.css"
import "../css/main.css"
import EmptySiteElement from "../components/EmptySiteElement"
import SiteElement from "../components/SiteElement"
import EmptySite from "./EmptySite"
import AddSite from "./AddSite"
import ContentSite from "./ContentSite"

class SiteZone extends React.Component {
    render() {
        switch (this.props.page) {
            case -1:
                return (
                    <EmptySite />
                );
            case 0:
                return (
                    <AddSite addSite={this.props.addSite} setModalActive={this.props.setModalActive} onCloseAdd={this.props.onCloseAdd} />
                );
            default:
                return (
                    <ContentSite deleteSite={this.props.deleteSite} pageInfo={this.props.pageInfo} setModalActive={this.props.setModalActive} />
                )
        }

    }

}

export default SiteZone