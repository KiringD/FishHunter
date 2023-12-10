import React, { useEffect, useState } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Virus from "../components/Virus"
import styles from "../css/platform.module.css"
import "../css/main.css"
import EmptySiteElement from "../components/EmptySiteElement"
import SiteElement from "../components/SiteElement"
import AddSite from "../components/AddSite"
import EmptySite from "../components/EmptySite"
import SiteZone from "../components/SiteZone"
import Sites from "../components/Sites"
import Modal from "../components/Modal"
import { useNavigate } from "react-router-dom"

import axios from "axios"
import Clones from "../components/Clones"
import CloneElement from "./CloneElement"

const ContentSite = (props) => {
    const [site, setSite] = useState({})
    const [clones, setClones] = useState([])
    const [buttonText, setButtonText] = useState("Редактировать")

    useEffect(() => {
        console.log(props.pageInfo)
        setSite(props.pageInfo)
        getClones()
        document.getElementById("url").value = props.pageInfo.url
        document.getElementById("title").value = props.pageInfo.title
        blockItems()
    }, [props.pageInfo])

    return (
        <div className={styles.siteWorkZone}>
            <div className={styles.siteTitle}>{site.title}</div>
            <div className={styles.addContent}>
                <div className={styles.siteInfoContainer}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <input id="url" type="text" placeholder="Ссылка" className={styles.siteInput} disabled></input>
                        <input id="title" type="text" placeholder="Название сайта" className={styles.siteInput} disabled></input>
                        <input type="checkbox" className={styles.checkboxInput} id="checkbox" />
                        <label htmlFor="checkbox">
                            <span id="checkbox_frame" className={styles.checkbox}>
                            </span>
                            <span id="checkbox_text" className={styles.checkboxText}>Автоматически проверять новые домены</span>
                        </label>
                    </div>
                    <div>
                        <div id="domain_text" className={styles.addSubTitle}>Доменные зоны для поиска</div>
                        <div className={styles.domainContainer}>
                            <div className={styles.domainItem}>com</div>
                            <div className={styles.domainItem}>ru</div>
                            <div className={styles.domainItem}>рф</div>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: "1rem", display: "flex", width: "100%", justifyContent: "space-evenly" }}>
                    <div onClick={onDelete} className={styles.buttonRed}>Удалить</div>
                    <div id="button" className={styles.button} onClick={onEdit}>{buttonText}</div>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} className={styles.addContent}>
                <div className={styles.zoneSubtitle}>Действия</div>
                <div style={{ display: "flex", marginTop: "1rem" }}>
                    <div id="button" className={styles.button} onClick={OnManualSearch}>Запустить ручной поиск сайтов</div>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} className={styles.addContent}>
                <div className={styles.zoneSubtitle}>Возможные клоны</div>
                <Clones clones={clones} onCloneDelete={onCloneDelete}></Clones>
            </div>
        </div>
    )

    function OnManualSearch() {
        const data = { "action": "manualSearch", "data": site.url }
        // console.log(this.state)
        axios.put('http://api.kiringspace.ru/api/upload', data, {
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(response => {
                // console.log('Response:', response.data);
                props.setModalActive(true, `Проверка успешно началась\nВнимание!! Проверка может занять продолжительное время`)
                // this.setState({image: response.data.message})
                // Обработайте ответ по вашему усмотрению
            })
            .catch(error => {
                console.error('Error:', error);
                // this.props.setModalActive(true, error.response.data)
                // Обработайте ошибку по вашему усмотрению
            });
    }

    function blockItems() {
        document.getElementById("checkbox_frame").style.border = "1px solid grey"
        document.getElementById("checkbox").disabled = true
        if (props.pageInfo.auto_search) {
            document.getElementById("checkbox").checked = true
        }
        else { document.getElementById("checkbox").checked = false }
        const elements = document.getElementsByClassName(styles.domainItem)
        elements[0].className = `${styles.domainItem} ${styles.com}`
        if (props.pageInfo.ru) {
            elements[1].className = `${styles.domainItem} ${styles.com} ${styles.selected}`
        }
        else elements[1].className = `${styles.domainItem} ${styles.com}`
        if (props.pageInfo.rf) {
            elements[2].className = `${styles.domainItem} ${styles.com} ${styles.selected}`
        }
        else elements[2].className = `${styles.domainItem} ${styles.com}`
        setButtonText("Редактировать")
    }

    function onEdit(event) {
        if (buttonText == "Редактировать") {
            document.getElementById("checkbox_frame").style.border = null
            document.getElementById("checkbox").disabled = false
            const elements = document.getElementsByClassName(styles.domainItem)
            if (props.pageInfo.ru) {
                elements[1].className = `${styles.domainItem} ${styles.selected}`
            }
            else elements[1].className = `${styles.domainItem}`
            if (props.pageInfo.rf) {
                elements[2].className = `${styles.domainItem} ${styles.selected}`
            }
            else elements[2].className = `${styles.domainItem}`
            setButtonText("Сохранить")
        }
        else {
            document.getElementById("checkbox_frame").style.border = "1px solid grey"
            document.getElementById("checkbox").disabled = true
            const elements = document.getElementsByClassName(styles.domainItem)
            if (props.pageInfo.ru) {
                elements[1].className = `${styles.domainItem} ${styles.com} ${styles.selected}`
            }
            else elements[1].className = `${styles.domainItem} ${styles.com}`
            if (props.pageInfo.rf) {
                elements[2].className = `${styles.domainItem} ${styles.com} ${styles.selected}`
            }
            else elements[2].className = `${styles.domainItem} ${styles.com}`
            setButtonText("Редактировать")
        }

    }

    function onDelete() {
        const token = localStorage.getItem('token');
        const data = { "action": "deleteUnit", "data": { "unit_id": site.unit_id } }
        // console.log(this.state)
        axios.put('http://api.kiringspace.ru/api/upload', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })
            .then(response => {
                // console.log('Response:', response.data);
                props.deleteSite(site.id)
                // this.setState({image: response.data.message})
                // Обработайте ответ по вашему усмотрению
            })
            .catch(error => {
                console.error('Error:', error);
                // this.props.setModalActive(true, error.response.data)
                // Обработайте ошибку по вашему усмотрению
            });
    }

    function getClones() {
        const data = { "action": "clones", "data": props.pageInfo.url }
        // console.log(this.state)
        axios.put('http://api.kiringspace.ru/api/upload', data, {
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(response => {
                console.log('Response:', response.data);
                // props.deleteSite(site.id)
                setClones(response.data)
                // Обработайте ответ по вашему усмотрению
            })
            .catch(error => {
                console.error('Error:', error);
                // this.props.setModalActive(true, error.response.data)
                // Обработайте ошибку по вашему усмотрению
            });
    }

    function onCloneDelete(clone_id) {
        const data = { "action": "deleteClone", "data": clone_id }
        // console.log(this.state)
        axios.put('http://api.kiringspace.ru/api/upload', data, {
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(response => {
                console.log('Response:', response.data);
                // props.deleteSite(site.id)
                // setClones(response.data)
                const data = { "action": "clones", "data": props.pageInfo.url }
                // console.log(this.state)
                axios.put('http://api.kiringspace.ru/api/upload', data, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                    .then(response => {
                        // console.log('Response:', response.data);
                        // props.deleteSite(site.id)
                        setClones(response.data)
                        // Обработайте ответ по вашему усмотрению
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        // this.props.setModalActive(true, error.response.data)
                        // Обработайте ошибку по вашему усмотрению
                    });
                // Обработайте ответ по вашему усмотрению
            })
            .catch(error => {
                console.error('Error:', error);
                // this.props.setModalActive(true, error.response.data)
                // Обработайте ошибку по вашему усмотрению
            });
    }

}

export default ContentSite