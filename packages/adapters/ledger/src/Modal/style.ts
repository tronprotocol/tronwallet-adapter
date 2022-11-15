export const modalStyleSheetContent = `
.ledger-modal-mask, .ledger-modal-wrap {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1000;
    font-family: 'PingFangSC-Regular', 'Arial', sans-serif, 'Droid Sans', 'Helvetica Neue';
}
.ledger-modal-mask {
    height: 100%;
    background-color: rgba(0, 0, 0, 0.45);
}
.ledger-modal-wrap {
    overflow: auto;
    outline: 0;
}
.ledger-modal {
  position: relative;
  margin: 0 auto;
  padding-bottom: 24px;
  line-height: 1.5;
  top: 50px;
  width: 600px;
  color: rgba(0, 0, 0, 0.65);
}
.ledger-modal-content {
  position: relative;
  background-color: #fff;
  background-clip: padding-box;
  border: 0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  pointer-events: auto;
}
.ledger-modal-close {
  -webkit-appearance: button;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  padding: 0;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  background: transparent;
  border: 0;
  outline: 0;
  cursor: pointer;
  transition: color 0.3s;
}
.ledger-modal-close:focus, .ledger-modal-close:hover {
  color: rgba(0, 0, 0, 0.75);
  text-decoration: none;
}
.ledger-modal-close-x {
  display: block;
  width: 56px;
  height: 56px;
  font-size: 16px;
  font-style: normal;
  line-height: 56px;
  text-align: center;
  text-transform: none;
  text-rendering: auto;
}
.ledger-modal-close-x .icon {
  display: inline-block;
  color: inherit;
  font-style: normal;
  line-height: 0;
  text-align: center;
  text-transform: none;
  vertical-align: -0.125em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
.ledger-modal-header {
  padding: 16px 24px;
  color: rgba(0, 0, 0, 0.65);
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  border-radius: 4px 4px 0 0;
}
.ledger-select .title, .ledger-modal-title {
  margin: 0;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  font-size: 18px;
  line-height: 22px;
  word-wrap: break-word;
}
.ledger-modal-body {
  padding: 24px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  max-height: 650px;
  overflow-y: auto;
}


// connecting content
.ledger-connecting-pop ul {
  margin: 0;
}
.ledger-connecting-pop-content {
  padding-left: 8%;
}
.ledger-connecting-pop-content li, .ledger-select li {
  display: flex;
  margin: 10px 0 10px 0;
  line-height: 25px;
  word-break: break-all;
  text-align: left;
}
.ledger-connecting-pop-content .title {
  margin-bottom: 20px;
  font-weight: bold;
}
.ant-spin {
  box-sizing: border-box;
  padding: 0;
  font-size: 14px;
  font-variant: tabular-nums;
  line-height: 1.5;
  list-style: none;
  font-feature-settings: 'tnum';
  color: #B0170D;
  vertical-align: middle;
  transition: transform 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
  position: static;
  opacity: 1;
  margin: 2vw 0;
  text-align: center;
  display: block;
}
.ant-spin-dot {
  position: relative;
  display: inline-block;
  font-size: 20px;
  width: 1em;
  height: 1em;
  transform: rotate(45deg);
  animation: antRotate 1.2s infinite linear;
  font-size: 32px;
}

.ant-spin-dot-item {
  position: absolute;
  display: block;
  width: 9px;
  height: 9px;
  background-color: #B0170D;
  border-radius: 100%;
  transform: scale(0.75);
  transform-origin: 50% 50%;
  opacity: 0.3;
  animation: antSpinMove 1s infinite linear alternate;
}
.ant-spin-dot-item:nth-child(1) {
  top: 0;
  left: 0;
}
.ant-spin-dot-item:nth-child(2) {
  top: 0;
  right: 0;
  animation-delay: 0.4s;
}
.ant-spin-dot-item:nth-child(3) {
  right: 0;
  bottom: 0;
  animation-delay: 0.8s;
}
.ant-spin-dot-item:nth-child(4) {
  bottom: 0;
  left: 0;
  animation-delay: 1.2s;
}
.ant-spin-lg .ant-spin-dot i {
  width: 14px;
  height: 14px;
}
@keyframes antRotate {
  100% {
    transform: rotate(405deg)
  }
}
@keyframes antSpinMove {
  100% {
    opacity: 1;
  }
}

.ledger-select {
  text-align: left;
}
.ledger-select .title {
  display: block;
  margin-bottom: 10px;
}
.ledger-select-list-wrap {
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  margin: 0 0 20px 0;
}
.ledger-select-list {
  margin-top: 0;
  padding: 0;
}
.ledger-select-item {
  font-size: 14px;
  color: #2f2f2f;
  line-height: 25px;
  margin-top: 0;
}
.ledger-select-item:hover {
  color: #6f6f6f;
}
.ledger-select-item label {
  cursor: pointer;
  width: 100%;
  display: flex;
}
.ledger-select-item input {
  width: 15px;
  height: 25px;
  margin: 0 10px 0 0;
}
.ledger-select-button {
  display: inline-flex;
  color: #fff;
  cursor: pointer;
  height: 36px;
  background-color: #c23631;
  border: none;
  border-radius: 4px;
  align-items: center;
  padding: 0 18px;
  font-family: DM Sans, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 36px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.ledger-select-button[disabled] {
  cursor: not-allowed;
}
.ledger-select-button.default-button {
  background-color: #fff;
  color: rgba(0, 0, 0, 0.65);
  border: 1px solid #dcdfe6;
}
.ledger-select-button:focus {
  outline: none;
}
.ledger-select-button:focus-visible {
  outline: 2px solid white;
}
.ledger-select-button:hover {
  opacity: 0.7;
}
`;
