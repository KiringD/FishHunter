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

const Platform = () => {
    const [user_name, setUserName] = useState("")
    const [sites, setSites] = useState([]);
    const [trigger, setTrigger] = useState(0)
    const [active_page, setActivePage] = useState(-1)
    const [modal, setModal] = useState({
        modalActive: false,
        modalText: "",
    })

    const navigate = useNavigate()

    useEffect(() => {
        document.body.style.backgroundColor = "#f1f5f8";
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login')
        }
        else {
            console.log('useEffect is running...');
            // const token = localStorage.getItem('token');
            const token = localStorage.getItem('token');
            var data = { "action": "units", "data": {} }
            axios.put('http://api.kiringspace.ru/api/upload', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })
                .then(response => {
                    console.log('Response:', response.data);
                    const result = response.data
                    if (result != null) {
                        setSites(prevSites => {
                            var id = 0; // Start id from the current length of the array
                            console.log('id:', id);
                            return [
                                ...result.map(unit => {
                                    id++;
                                    return {
                                        id,
                                        unit_id: unit.id,
                                        url: unit.url,
                                        title: unit.title,
                                        preview: unit.picture,
                                        auto_search: unit.auto_search,
                                        search_perc: unit.search_perc,
                                        ru: unit.ru,
                                        rf: unit.rf,
                                    };
                                }),
                            ];
                        });
                    }

                })
                .catch(error => {
                    // console.error('Error:', error);
                });

            var data = { "action": "username", "data": {} }
            axios.put('http://api.kiringspace.ru/api/upload', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })
                .then(response => {
                    console.log('Response:', response.data);
                    const result = response.data
                    setUserName("Добро пожаловать, " + result)
                })
                .catch(error => {
                    console.error('Error:', error);
                })


        }

        console.log("sites", sites)

        return () => {
            document.body.style.backgroundColor = null;
        };
    }, []);

    // componentWillUnmount (){
    //     document.body.style.backgroundColor = null;
    // }



    return (
        <div>
            <Header display="none" title="FishHunter" />
            <div className={styles.zone}>
                <div className={styles.accountName}>{user_name}</div>
                <Virus height="17rem" width="17rem" right="-8.5rem" top="-4rem" rotate_degree={0.2} fill="#ADE0DF"></Virus>
                <div className={styles.workZone}>
                    <div className={styles.sitesPanel}>
                        <Sites trigger={trigger} openPage={openPage} sites={sites}></Sites>
                    </div>
                    <SiteZone deleteSite={deleteSite} setModalActive={setModalActive} page={active_page} pageInfo={sites[active_page - 1]} addSite={addSite} onCloseAdd={closeSiteAddPage}></SiteZone>
                </div>
            </div>

            {/* <Footer></Footer> */}
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

    function addSite(site) {
        const id = sites.length + 1

        setSites(prevSites => [...prevSites, { id, ...site }]);
        closeSiteAddPage()
    }

    function deleteSite(site_id) {
        setActivePage(-1)
        setTrigger(trigger + 1)

        const token = localStorage.getItem('token');
        var data = { "action": "units", "data": {} }
        axios.put('http://api.kiringspace.ru/api/upload', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })
            .then(response => {
                console.log('Response:', response.data);
                const result = response.data
                if (result != null) {
                    setSites(prevSites => {
                        var id = 0; // Start id from the current length of the array
                        console.log('id:', id);
                        return [
                            ...result.map(unit => {
                                id++;
                                return {
                                    id,
                                    unit_id: unit.id,
                                    url: unit.url,
                                    title: unit.title,
                                    preview: unit.picture,
                                    auto_search: unit.auto_search,
                                    search_perc: unit.search_perc,
                                    ru: unit.ru,
                                    rf: unit.rf,
                                };
                            }),
                        ];
                    });
                }
                else {
                    setSites([])
                }

            })
            .catch(error => {
                console.error('Error:', error);
            });
    }


    function openPage(page) {
        setActivePage(page)

    }



    function closeSiteAddPage() {
        setActivePage(-1)
        setTrigger(trigger + 1)
    }
}

export default Platform