import { Box, Tab, Tabs } from '@mui/material';
import React from 'react';
import { LedgerAdapterDemo } from './LedgerAdapterDemo.js';
import { CustomConnectWithSelectAccount } from './LedgerDemo/CustomConnectWithSelectAccount.js';
import { CustomConnectWithGetAccounts } from './LedgerDemo/CustomConnectWithGetAccounts.js';
import { TronLinkAdapterDemo } from './TronLinkAdapterDemo.js';
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}
function App() {
    const [value, setValue] = React.useState(() => {
        return Number(localStorage.getItem('tab')) || 0;
    });

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        localStorage.setItem('tab', String(newValue));
        setValue(newValue);
    };
    return (
        <div className="App">
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="TronLinkAdapter Demo" />
                        <Tab label="LedgerAdapter Demo" />
                        <Tab label="LedgerAdapter CustomConnectWithSelectAccount" />
                        <Tab label="LedgerAdapter CustomConnectWithGetAccounts" />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    <TronLinkAdapterDemo></TronLinkAdapterDemo>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <LedgerAdapterDemo></LedgerAdapterDemo>
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <CustomConnectWithSelectAccount></CustomConnectWithSelectAccount>
                </TabPanel>
                <TabPanel value={value} index={3}>
                    <CustomConnectWithGetAccounts></CustomConnectWithGetAccounts>
                </TabPanel>
            </Box>
        </div>
    );
}

export default App;
