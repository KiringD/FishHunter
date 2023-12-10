import React, { useEffect, useLayoutEffect } from "react"
import Header from "../components/Header"
import StartButton from "../components/StartButton"
import Footer from "../components/Footer"
import Virus from "../components/Virus"
import MainTitle from "../components/MainTitle"
import "../css/main.css"
import "../css/landing.css"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


// import withRouter from "../tools/WithRouter"



const Private = () => {
    const navigate = useNavigate()

    const handleClick = () => {
        const token = localStorage.getItem('token');
        console.log(token)
        axios.get('http://api.kiringspace.ru/api/upload', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })
            .then(response => {
                console.log('Response:', response.data);
                // token = response.data.message
            })
            .catch(error => {
                console.error('Error:', error);

            });

        // handleLogout()

        // const token2 = localStorage.getItem('token');
        // axios.get('http://localhost:8080/api/gg', {
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${token2}`
        //     },
        // })
        // .then(response => {
        //     console.log('Response:', response.data);
        //     // token = response.data.message
        // })
        // .catch(error => {
        //     console.error('Error:', error);

        // });
    }

    // };
    const handleAuthentication = async () => {
        // Логика аутентификации (например, с использованием API)
        console.log(1)
        let token;
        // Navigate to Another Component
        // navigate("/login");
        const data = { "action": "gg", "data": {} }
        axios.put('http://api.kiringspace.ru/api/upload', data, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                console.log('Response:', response.data);
                token = response.data.message
                localStorage.setItem("token", token);
            })
            .catch(error => {
                console.error('Error:', error);

            });

    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        // Дополнительные действия при выходе
        // history.push("/login");
    };

    useEffect(() => {
        // handleAuthentication()
        // handleLogout()
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Token not found')
            // navigate("/login");
        }
        else {
            console.log('Token found')
        }
    }, []);

    // const token = localStorage.getItem('token');

    //         if (!token) {
    //             // Если нет токена, перенаправляем на страницу входа
    //             const { navigate } = this.props;

    //             navigate("/login");
    //  // Предполагается использование React Router
    //             return null;
    //         }

    return (
        <div>
            <Header display="inline-block" title="FishHunter" />
            <Virus height="25rem" width="25rem" right="15rem" top="8rem" rotate_degree={0.5} fill="#ADE0DF"></Virus>
            <Virus height="15rem" width="14rem" left="15rem" bottom="8rem" rotate_degree={-1} fill="#3A506B"></Virus>
            <div className="buttonContainer">
                <MainTitle></MainTitle>
                <div onClick={handleClick}>sadfasdfasdfgvdf</div>
                {/* <StartButton style={{zIndex:1}}></StartButton> */}
            </div>
            <Footer></Footer>
        </div>
    )

}


export default Private