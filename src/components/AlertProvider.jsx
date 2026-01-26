/**
 * Alert Provider
 * Bridges Zustand UI store with Ant Design message API
 */
import React, { useEffect } from "react";
import { message } from "antd";
import { useUIStore } from "../stores";

const AlertProvider = ({ children }) => {
    const [messageApi, contextHolder] = message.useMessage();
    const alertQueue = useUIStore((state) => state.alertQueue);
    const clearAlert = useUIStore((state) => state.clearAlert);

    useEffect(() => {
        if (alertQueue.length > 0) {
            const alert = alertQueue[0];
            messageApi.open({
                key: "global_alert",
                type: alert.type,
                content: alert.content,
            });
            clearAlert();
        }
    }, [alertQueue, messageApi, clearAlert]);

    return (
        <>
            {contextHolder}
            {children}
        </>
    );
};

export default AlertProvider;
