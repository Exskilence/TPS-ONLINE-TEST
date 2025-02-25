import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Questions = () => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState('sql');

    const questions = [
        {
            id: 1,
            type: 'sql',
            question: "Write an SQL query to fetch all records from the 'employees' table.",
            navigateTo: '/SQLEditor'
        },
        {
            id: 2,
            type: 'python',
            question: "Write a Python function to check if a number is prime.",
            navigateTo: '/PyEditor'
        },
        {
            id: 3,
            type: 'htmlcss',
            question: "Create a responsive webpage layout using HTML and CSS.",
            navigateTo: '/HTMLCSSEditor'
        },
        {
            id: 4,
            type: 'htmlcssjs',
            question: "Implement a JavaScript function to toggle the visibility of an HTML element.",
            navigateTo: '/JSEditor'
        }
    ];

    const handleSolve = (navigateTo) => {
        navigate(navigateTo);
    };

    return (
        <div className="container-fluid p-0" style={{ height: '100vh', overflowY: 'auto' }}>
            <div className="bg-white border rounded-2 py-3 ps-3 " style={{ height: '100%' }}>
                <div className="d-flex h-100">
                    <div className="flex-grow-1 d-flex flex-column" style={{ height: '100%' }}>
                        <div className="border border-dark rounded-2 me-2" style={{ height: '100vh', overflow: 'auto' }}>
                            <div className="border-bottom border-dark p-3">
                                <h5 className="m-0">Questions</h5>
                            </div>
                            <div className="p-3">
                                {questions.map((question) => (
                                    <div key={question.id} className="mb-4">
                                        <div className="d-flex align-items-start justify-content-between">
                                            <div className='d-flex flex-column'>
                                                <div className="d-flex align-items-start">
                                                    <span className="me-2">{question.id}.</span>
                                                    <span style={{ wordBreak: 'break-word' }}>{question.question}</span>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-5" style={{ minWidth: '275px' }}>
                                                <button
                                                    className="btn me-3"
                                                    style={{
                                                        minWidth: '80px',
                                                        backgroundColor: '#D4DCFF',
                                                        border: '1px solid black',
                                                        color: 'black',
                                                    }}
                                                    onClick={() => handleSolve(question.navigateTo)}
                                                >
                                                    Solve
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Questions;
