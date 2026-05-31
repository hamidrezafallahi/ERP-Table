import { useState } from "react";
import { CustomButton, CustomModal } from "../../atoms/defaultElements";
import { IManualReport } from "./type";
import { Viewer } from "./viewer";


export const ManualReport = ({ reportBtnName, reportTitle ,rules}: IManualReport) => {

    const [openModal, setOpenModal] = useState(false);
    return (
        <>
            <CustomButton
                type="text"
                htmlType="button"
                className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
                onClick={() => setOpenModal(true)}
            >
            
                {reportBtnName}
            </CustomButton>

            <CustomModal
                title={reportTitle}
                content={<Viewer rules={rules} />}
                withFullscreen
                width="75%"
                closeModal={() => {
                    setOpenModal(false);
                }}
                isModalOpen={openModal}
            />
        </>
    );
}