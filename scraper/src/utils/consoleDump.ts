import { ConsoleMessage, ConsoleMessageType } from 'puppeteer';

type MessageType = Extract<ConsoleMessageType, 'log' | 'debug' | 'info' | 'error' | 'warning'> | 'default';
type ConsoleFunction = typeof console.log;

const functionMap: Record<MessageType, ConsoleFunction> = {
    log: console.log,
    debug: console.debug,
    error: console.error,
    info: console.info,
    warning: console.warn,

    default: console.log,
};

export const consoleDump = (msg: ConsoleMessage) => {
    const msgType = msg.type();
    if (!functionMap.hasOwnProperty(msgType)) {
        return;
    }

    functionMap[msgType as MessageType](msg.text());
};
