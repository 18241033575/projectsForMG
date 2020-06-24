import { message } from 'antd';


/*
    message.success(content, [duration], onClose)

    message.error(content, [duration], onClose)

    message.info(content, [duration], onClose)

    message.warning(content, [duration], onClose)

    message.warn(content, [duration], onClose) // alias of warning

    message.loading(content, [duration], onClose)
*/
export function showMessage(msg, type = 'info', duration = 3, fn = () => {}) {
    message.config({
        maxCount: 1,
    });
    message[type](msg, duration, () => {
        fn()
    }, 1);
}