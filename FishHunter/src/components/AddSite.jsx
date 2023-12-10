import React from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Virus from "../components/Virus"
import styles from "../css/platform.module.css"
import "../css/main.css"
import EmptySiteElement from "../components/EmptySiteElement"
import SiteElement from "../components/SiteElement"


import axios from 'axios';

class AddSite extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: "",
            unitData: {
                url: "",
                auto_search: false,
                ru: false,
                rf: false,
            },
        }

        this.Click = this.Click.bind(this)
        this.onAddButton = this.onAddButton.bind(this)
        this.setUrl = this.setUrl.bind(this)
        this.setAutoSearch = this.setAutoSearch.bind(this)
        this.setDomainZone = this.setDomainZone.bind(this);
    }

    render() {
        return (
            <div className={styles.siteWorkZone}>
                <div className={styles.addTitle}>Новый сайт</div>
                <div className={styles.addContent}>
                    <div className={styles.addFirstlineContainer}>
                        <div>
                            <div className={styles.addSubTitle}>Ссылка на сайт</div>
                            <div className={styles.formGroup}>
                                <span>https://</span>
                                <input className={styles.formField} onChange={this.setUrl} type="text" placeholder="domain.tld" />
                            </div>
                        </div>
                        <div>
                            <div className={styles.addSubTitle}>Доменные зоны для поиска</div>
                            <div className={styles.domainContainer}>
                                <div onClick={() => console.log(this.state)} className={`${styles.domainItem} ${styles.com}`}>com</div>
                                <div id="ru" onClick={this.setDomainZone} className={styles.domainItem}>ru</div>
                                <div id="rf" onClick={this.setDomainZone} className={styles.domainItem}>рф</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <input type="checkbox" className={styles.checkboxInput} onChange={this.setAutoSearch} id="checkbox" />
                        <label htmlFor="checkbox">
                            <span className={styles.checkbox}>
                            </span>
                            <span className={styles.checkboxText}>Автоматически проверять новые домены</span>
                        </label>
                    </div>
                </div>

                <button className={`${styles.addButton} ${styles.buttonMimas}`} onClick={() => this.onAddButton()} role="button"><span>Добавить</span></button>
                <div onClick={() => this.props.onCloseAdd()} className={styles.backButton}>Отмена</div>
            </div>
        )
    }


    setUrl = (event) => {
        this.setState((prevState) => ({
            unitData: {
                ...prevState.unitData,
                ["url"]: event.target.value,
            },
        }));

    }

    setAutoSearch = (event) => {
        const isChecked = event.target.checked;
        this.setState((prevState) => ({
            unitData: {
                ...prevState.unitData,
                ["auto_search"]: isChecked,
            },
        }));

    }

    setDomainZone = (event) => {
        const currentClasses = event.currentTarget.className;
        const currentIds = event.currentTarget.id;

        if (!currentClasses.includes(styles.selected) && !currentIds.includes(styles.com)) {
            event.currentTarget.classList.add(styles.selected)
            if (currentIds == "ru") {
                this.setState((prevState) => ({
                    unitData: {
                        ...prevState.unitData,
                        ["ru"]: true,
                    },
                }));
            }
            else if (currentIds == "rf") {
                this.setState((prevState) => ({
                    unitData: {
                        ...prevState.unitData,
                        ["rf"]: true,
                    },
                }));
            }

        }
        else {
            event.currentTarget.classList.remove(styles.selected)
            if (currentIds == "ru") {
                this.setState((prevState) => ({
                    unitData: {
                        ...prevState.unitData,
                        ["ru"]: false,
                    },
                }));
            }
            else if (currentIds == "rf") {
                this.setState((prevState) => ({
                    unitData: {
                        ...prevState.unitData,
                        ["rf"]: false,
                    },
                }));
            }
        }


    }

    onAddButton = (event) => {
        if (this.state.unitData.url == "") {
            this.props.setModalActive(true, "Укажите ссылку на сайт для отслеживания")
            return
        }
        if (!this.state.unitData.rf && !this.state.unitData.ru) {
            this.props.setModalActive(true, "Необходимо выбрать как минимум одну доменную зону")
            return
        }

        const token = localStorage.getItem('token');
        const data = { "action": "unit", "data": this.state.unitData }
        // console.log(this.state)
        axios.put('http://api.kiringspace.ru/api/upload', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })
            .then(response => {
                console.log('Response:', response.data);
                const site = {
                    unit_id: response.data.id,
                    url: response.data.url,
                    title: response.data.title,
                    preview: response.data.preview,
                    auto_search: response.data.auto_search,
                    search_perc: response.data.search_perc,
                    ru: response.data.ru,
                    rf: response.data.rf,
                }
                this.props.addSite(site)
                // this.setState({image: response.data.message})
                // Обработайте ответ по вашему усмотрению
            })
            .catch(error => {
                console.error('Error:', error);
                this.props.setModalActive(true, error.response.data)
                // Обработайте ошибку по вашему усмотрению
            });

    }

    Click = (event) => {

        // const currentClasses = event.currentTarget.className;
        // const currentIds = event.currentTarget.id;

        // let myVariable;
        // fetch('http://localhost:8080/api/download?file=1.jpg')
        // .then(res => res.blob())
        // .then(blob => {
        //     const reader = new FileReader();
        //     reader.readAsDataURL(blob);
        //     reader.onloadend = () => {
        //         this.setState({image: reader.result})
        //         console.log(reader.result)
        //     }
        // });
        // fetch('http://localhost:8080/api/data')
        // .then(response => response.text())
        // .then(data => {
        //     myVariable = data;  // Присваивание данных переменной
        //     console.log(myVariable);  // Вывод данных в консоль (опционально)
        // })
        // .catch(error => console.error(error));

        // event.currentTarget.style.content = url("http://imgur.com/SZ8Cm.jpg");


    }

}

export default AddSite