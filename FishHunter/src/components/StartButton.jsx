import React from "react"
import { useNavigate } from 'react-router-dom';


const StartButton = () => {
    const navigate = useNavigate()

    const onStartClick = () => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate("/login");
        }
        else {
            navigate("/platform");
        }
    }

    return (
        <div onClick={onStartClick} className="startButton">
            Начать
        </div>
    )
}

export default StartButton