import React from 'react';

const thank_you = () => {
  return (
    <div className="bg-gradient-to-b from-green-400 to-green-600 min-h-screen flex flex-col justify-center items-center text-center">

      <div className="w-80 bg-green rounded-lg shadow-md p-4 mb-4" >
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="block text-center">Thank you for using our app! You have been successfully logged out! </span>
      </div>

      <div className="p-10">
        <button onClick={() => (window.location.href = "/")} className="btn btn-success">Go back to the app</button>
      </div>

    </div>
  );
};

export default thank_you;
