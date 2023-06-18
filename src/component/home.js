import React from "react";
import "./home.css";

function Home()
{
    return (
        <div className="Scroller">
            <div className="Container Start">
                <h1>VerifyBot</h1>
                <h2>A ReactJS based chatbot<br/> designed to assist users in verification</h2>
            </div>
            <div className="Container About"></div>
            <div className="Container Install"></div>
            <div className="Container Reverse">
            <div className="Container Features"></div>
            </div>
            <div className="Container Reverse">
            <div className="Container Feature1"></div>
            </div>
            <div className="Container Reverse">
            <div className="Container Feature2"></div>
            </div>
            <div className="Container Reverse">
            <div className="Container Feature3"></div>
            </div>
            <div className="Container Reverse">
            <div className="Container Tutorial2"></div>
            </div>
            <div className="Container Reverse">
            <div className="Container Working"></div>
            </div>
            <div className="Container Reverse">
            </div>
            <div className="CheckOutMessage"></div>
        </div>
    );
}

export default Home