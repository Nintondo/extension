import { FingerPrintIcon } from "@heroicons/react/24/solid";
import Layout from "../layout";

const Connect = () => {
  return (
    <Layout
      documentTitle="Connecting"
      resolveBtnText="Connect"
      resolveBtnClassName="bg-text text-bg hover:bg-green-500 hover:text-text"
    >
      <FingerPrintIcon className="w-40 h-40 text-green-400 bg-input-bg rounded-full p-4" />
      <h3 className="text-xl font-medium">Access required</h3>
    </Layout>
  );
};

export default Connect;
