import { FC, useEffect, useId } from "react";
import s from "./styles.module.scss";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import Modal from "../modal";
import { t } from "i18next";

interface Props {
  handler: (name: string) => void;
  active: boolean;
  onClose: () => void;
  currentName?: string;
}

const Rename: FC<Props> = ({ handler, active, onClose, currentName }) => {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string }>({
    defaultValues: {
      name: "",
    },
  });
  const renameId = useId();

  const onRename = ({ name }: { name: string }) => {
    handler(name.trim());
  };

  const onSubmit = () => {
    if (errors.name) {
      toast.error(errors.name.message);
    }
  };

  useEffect(() => { setValue("name", currentName) }, [currentName, setValue])

  return (
    <Modal open={active} onClose={onClose} title={t("components.rename.rename")}>
      <form className={s.form} onSubmit={handleSubmit(onRename)}>
        <div>
          <label htmlFor={renameId} className={s.label}>
            {t("components.rename.enter_new_name")}
          </label>
          <input
            id={renameId}
            className="input w-full"
            {...register("name", {
              minLength: {
                value: 1,
                message: t("components.rename.enter_new_name"),
              },
              maxLength: {
                value: 16,
                message: t("components.rename.maximum_length"),
              },
              required: t("components.rename.name_is_required"),
            })}
          />
        </div>
        <button className="btn primary mx-auto w-2/3" onClick={onSubmit}>
          {t("components.rename.save")}
        </button>
      </form>
    </Modal>
  );
};

export default Rename;
