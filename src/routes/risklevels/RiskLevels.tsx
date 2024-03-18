import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import DataService from '../../services/DataService';
import { Pair } from '../../models/ApiData';
import { FriendlyFormatNumber, roundTo, sleep } from '../../utils/Utils';
import { SimpleAlert } from '../../components/SimpleAlert';
import { RiskLevelGraphs, RiskLevelGraphsSkeleton } from './RiskLevelGraph';
import { MORPHO_RISK_PARAMETERS_ARRAY } from '../../utils/Constants';
import { useLocation } from 'react-router-dom';

export default function RiskLevels() {
  const [isLoading, setIsLoading] = useState(true);
  const [availablePairs, setAvailablePairs] = useState<Pair[]>([]);
  const [selectedPair, setSelectedPair] = useState<Pair>();
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [supplyCap, setSupplyCap] = useState<number | undefined>(undefined);
  const [tokenPrice, setTokenPrice] = useState<number | undefined>(undefined);
  const [parameters, setParameters] = useState(MORPHO_RISK_PARAMETERS_ARRAY);
  const [selectedLTV, setSelectedLTV] = useState<string>(MORPHO_RISK_PARAMETERS_ARRAY[1].ltv.toString());
  const [selectedBonus, setSelectedBonus] = useState<number>(MORPHO_RISK_PARAMETERS_ARRAY[1].bonus);
  const pathName = useLocation().pathname;
  const navPair = pathName.split('/')[2]
    ? { base: pathName.split('/')[2].split('-')[0], quote: pathName.split('/')[2].split('-')[1] }
    : undefined;
  const navLTV = pathName.split('/')[3]
    ? pathName.split('/')[3]
    : undefined;

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };
  const handleChangePair = (event: SelectChangeEvent) => {
    console.log(`handleChangePair: ${event.target.value}`);
    setSelectedPair({ base: event.target.value.split('/')[0], quote: event.target.value.split('/')[1] });
  };
  const handleChangeSupplyCap = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.value) {
      setSupplyCap(Number(event.target.value));
    }
  };
  const handleLTVChange = (event: SelectChangeEvent) => {
    setSelectedLTV(event.target.value);
    const foundParam = MORPHO_RISK_PARAMETERS_ARRAY.find(param => param.ltv.toString() === event.target.value);
    if (foundParam) {
      setSelectedBonus(foundParam.bonus);
      const updatedParameters = parameters.map((param) => ({
        ...param,
        visible: param.ltv.toString() === event.target.value,
      }));
      setParameters(updatedParameters);
    }
  };

  //// useEffect to load data
  useEffect(() => {
    setIsLoading(true);
    // Define an asynchronous function
    async function fetchData() {
      try {
        const data = await DataService.GetAvailablePairs('all');
        setAvailablePairs(
          data.sort((a, b) => a.base.localeCompare(b.base))
        );

        if (navPair && data.some(({ base, quote }) => base === navPair.base && quote === navPair.quote)) {
          setSelectedPair(navPair);
          if (navLTV) {
            setSelectedLTV(navLTV);
          }
        } else if (data.length > 0) {
          setSelectedPair(data[0]);
        }

        await sleep(1); // without this sleep, update the graph before changing the selected pair. so let it here
      } catch (error) {
        console.error('Error fetching data:', error);
        setOpenAlert(true);
        setIsLoading(false);
        if (error instanceof Error) {
          setAlertMsg(`Error fetching data: ${error.toString()}`);
        } else {
          setAlertMsg(`Unknown error`);
        }
      }
    }
    fetchData()
      .then(() => setIsLoading(false))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    async function getTokenPrice() {
      try {
        if (!selectedPair) {
          return;
        }
        const data = await DataService.GetLiquidityData('all', selectedPair.base, selectedPair.quote);

        /// get token price
        const liquidityObjectToArray = Object.keys(data.liquidity).map((_) => parseInt(_));
        const maxBlock = Math.max.apply(null, liquidityObjectToArray).toString();
        const tokenPrice = data.liquidity[maxBlock].priceMedian;
        setTokenPrice(tokenPrice);
        if (selectedPair?.quote === 'USDC') {
          setSupplyCap(roundTo(100_000_000 / tokenPrice, 0));
        }
        if (selectedPair?.quote === 'WETH') {
          setSupplyCap(roundTo(50_000 / tokenPrice, 0));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setOpenAlert(true);
        setIsLoading(false);
        if (error instanceof Error) {
          setAlertMsg(`Error fetching data: ${error.toString()}`);
        } else {
          setAlertMsg(`Unknown error`);
        }
      }
    }
    getTokenPrice()
      .then(() => setIsLoading(false))
      .catch(console.error);
  }, [selectedPair]);

  if (!selectedPair || !tokenPrice || !supplyCap) {
    return <RiskLevelGraphsSkeleton />;
  }
  return (
    <Box sx={{ mt: 10 }}>
      {isLoading ? (
        <RiskLevelGraphsSkeleton />
      ) : (
        <Grid container spacing={1} alignItems="baseline" justifyContent='center'>
          {/* First row: pairs select and slippage select */}
          <Grid item xs={8} sm={6} md={4} lg={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt:1, justifyContent:'center'}}>
            <FormControl>
            <InputLabel id="pair-select-label">Pair</InputLabel>
            <Select
              labelId="pair-select-label"
              id="pair-select"
              label="Pair"
              value={`${selectedPair.base}/${selectedPair.quote}`}
              onChange={handleChangePair}
            >
              {availablePairs.map((pair, index) => (
                <MenuItem key={index} value={`${pair.base}/${pair.quote}`}>
                  {`${pair.base}/${pair.quote}`}
                </MenuItem>
              ))}
            </Select>
            </FormControl>
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt:1, justifyContent:'center'  }}>
            <FormControl>
            <InputLabel id="ltv-select-label">LTV</InputLabel>
              <Select
                labelId="ltv-select-label"
                id="ltv-select"
                value={selectedLTV}
                label="LTV"
              variant="outlined"
              onChange={handleLTVChange}
              >
                {MORPHO_RISK_PARAMETERS_ARRAY.map((param, index) => (
                  <MenuItem key={index} value={(param.ltv).toString()}>
                    {param.ltv * 100}%
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt:1, justifyContent:'center'  }}>
            <TextField
              id="bonus-value"
              label="Liquidation Bonus"
              variant="outlined"
              disabled
              value={`${selectedBonus / 100}%`}
              InputProps={{
                readOnly: true, // Makes the TextField read-only
              }}
            />
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt:1, justifyContent:'center'  }}>
            <TextField
              sx={{
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                  display: 'none'
                },
                '& input[type=number]': {
                  MozAppearance: 'textfield'
                }
              }}
              required
              id="supply-cap-input"
              type="number"
              label={`Supply Cap in ${selectedPair.base}`}
              value={supplyCap}
              onChange={handleChangeSupplyCap}
            />
            <Typography sx={{ ml: '10px' }}>${FriendlyFormatNumber(supplyCap * tokenPrice)}</Typography>
          </Grid>
          <Grid item xs={12} lg={10}>
            <RiskLevelGraphs pair={selectedPair} parameters={parameters} supplyCap={supplyCap} platform={'all'} />
          </Grid>
        </Grid>
      )}

      <SimpleAlert alertMsg={alertMsg} handleCloseAlert={handleCloseAlert} openAlert={openAlert} />
    </Box>
  );
}