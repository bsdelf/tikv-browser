import React from 'react';
import { Button } from 'antd';

interface DownloadButtonProps {
  name: string;
  data: Uint8Array;
}

export const DownloadButton = (props: DownloadButtonProps) => {
  const onClick = () => {
    const fileName = `${props.name}.bin`;
    const blob = new Blob([props.data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return <Button onClick={onClick}>Download Raw</Button>;
};

export default DownloadButton;
