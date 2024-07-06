import { useControllersState } from "@/ui/states/controllerState";
import { useGetCurrentWallet } from "@/ui/states/walletState";
import { ss } from "@/ui/utils";
import { useEffect, useState } from "react";
import Loading from "react-loading";
import { Navigate, useNavigate } from "react-router-dom";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string>();
  const currentWallet = useGetCurrentWallet();
  const navigate = useNavigate();

  const { stateController } = useControllersState(ss(["stateController"]));

  useEffect(() => {
    setLoading(true);
    stateController
      .getPendingWallet()
      .then((v) => {
        setLoading(false);
        setPending(v);
      })
      .catch(console.error);
  }, [stateController]);

  useEffect(() => {
    if (loading) return;
    if (pending) {
      navigate("/pages/new-mnemonic", {
        state: {
          pending,
        },
      });
    } else if (currentWallet) {
      navigate("/home", { state: { force: true } });
    }
  }, [pending, navigate, currentWallet, loading]);

  if (!currentWallet) return <Navigate to={"/pages/create-new-wallet"} />;

  return <Loading color="red" type="bubbles" />;
};

export default Home;
