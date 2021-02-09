import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="https://github.com/austintgriffith/scaffold-eth" target="_blank" rel="noopener noreferrer">
      <PageHeader title="LevAave" subTitle="Leveraged position with Aave and 1inch" style={{ cursor: "pointer" }} />
    </a>
  );
}
