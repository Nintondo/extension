import { useControllersState } from "@/ui/states/controllerState";
import { useGetCurrentWallet } from "@/ui/states/walletState";
import { useEffect } from "react";
import Loading from "react-loading";
import { Navigate, useNavigate } from "react-router-dom";

const Home = () => {
  const currentWallet = useGetCurrentWallet();
  const navigate = useNavigate();

  const { stateController } = useControllersState((v) => ({
    stateController: v.stateController,
  }));

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const pending = await stateController.getPendingWallet();
      if (pending) {
        navigate("/pages/new-mnemonic", {
          state: {
            pending,
          },
        });
      } else if (currentWallet) {
        navigate("/home");
      }
    })();
  }, [stateController, navigate, currentWallet]);

  if (!currentWallet) return <Navigate to={"/pages/create-new-wallet"} />;

  return <Loading />;
};

export default Home;
