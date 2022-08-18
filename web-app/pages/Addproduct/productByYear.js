import React, { useState } from 'react';
// import {axio}
// import config from '../config';
import WordPressClient from '../../utils/clients/wordpress';

function productByYear() {
    const [data, setData] = useState({});
    const inputHandler = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };
    const submitHandler = async (e) => {
        e.preventDefault();
        const success = await WordPressClient.postTruck(data);
        if (success) {
            console.log(success);
        } else {
            console.log('error');
        }
    };
    console.log('data', data);
    return (
        <div className="w-full h-screen bg-blue-500 pt-20">
            <div>
                <h1 className="text-3xl text-center py-4">Add Product By Year</h1>
                <form className="flex flex-col gap-5 items-center justify-center " onSubmit={submitHandler}>
                    <input
                        style={{ height: '40px', width: '300px', textIndent: '10px' }}
                        className="w-[100px] bg-gray-50 h-[30px] !pl-[10px] text-xl outline-none !indent-7 rounded-md"
                        type="text"
                        name="year"
                        required
                        onChange={inputHandler}
                        placeholder="Enter Year"
                    />
                    <input
                        style={{ height: '40px', width: '300px', textIndent: '10px' }}
                        className="w-[100px] bg-gray-50 h-[30px] !pl-[10px] text-xl outline-none !indent-7 rounded-md"
                        type="text"
                        name="make"
                        required
                        onChange={inputHandler}
                        placeholder="Enter Make"
                    />{' '}
                    <input
                        style={{ height: '40px', width: '300px', textIndent: '10px' }}
                        className="w-[100px] bg-gray-50 h-[30px] !pl-[10px] text-xl outline-none !indent-7 rounded-md"
                        type="text"
                        name="model"
                        required
                        onChange={inputHandler}
                        placeholder="Enter Model"
                    />{' '}
                    <input
                        style={{ height: '40px', width: '300px', textIndent: '10px' }}
                        className="w-[100px] bg-gray-50 h-[30px] !pl-[10px] text-xl outline-none !indent-7 rounded-md"
                        type="text"
                        name="trim"
                        required
                        onChange={inputHandler}
                        placeholder="Enter Trim"
                    />{' '}
                    <input
                        style={{ height: '40px', width: '300px', textIndent: '10px' }}
                        className="w-[100px] bg-gray-50 h-[30px] !pl-[10px] text-xl outline-none !indent-7 rounded-md"
                        type="text"
                        name="hub"
                        required
                        onChange={inputHandler}
                        placeholder="Enter Hub"
                    />{' '}
                    <input
                        style={{ height: '40px', width: '300px', textIndent: '10px' }}
                        className="w-[100px] bg-gray-50 h-[30px] !pl-[10px] text-xl outline-none !indent-7 rounded-md"
                        type="text"
                        name="bolt_pattern"
                        required
                        onChange={inputHandler}
                        placeholder="Enter Bolt Pattern"
                    />
                    <button
                        type="submit"
                        style={{ width: '270px', height: '50px' }}
                        className="bg-green-600 rounded-lg text-2xl text-white"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}

export default productByYear;
