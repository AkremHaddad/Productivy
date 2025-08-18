import React from "react";
import { FcGoogle } from "react-icons/fc";

const GoogleLoginButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 
                 border border-gray-300 rounded-lg px-4 py-2 
                 bg-white text-gray-700 font-medium 
                 shadow-sm hover:shadow-md transition"
    >
      <FcGoogle size={22} />
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
