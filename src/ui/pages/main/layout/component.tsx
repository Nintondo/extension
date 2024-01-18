import { NewspaperIcon, WalletIcon } from "@heroicons/react/24/outline";
import { Outlet, useNavigate } from "react-router-dom";

const Layout = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col w-full h-full">
      <Outlet />
      <div className="absolute bottom-0 w-full flex justify-center align-center text-white p-4">
        <div className="flex justify-evenly w-full bg-input-bg rounded-xl px-4 py-2">
          <WalletIcon
            onClick={() => {
              navigate("/home");
            }}
            className="w-6 h-6 cursor-pointer"
          />
          <NewspaperIcon
            onClick={() => {
              navigate("/home/inscriptions");
            }}
            className="w-6 h-6 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;
