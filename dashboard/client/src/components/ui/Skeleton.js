"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skeleton = ({ className = "", width, height }) => {
    return (<div className={`skeleton ${className}`} style={{
            width: width,
            height: height
        }}/>);
};
exports.default = Skeleton;
