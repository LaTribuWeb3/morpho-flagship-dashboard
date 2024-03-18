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
import { OverviewData } from '../../models/OverviewData';

export default function RiskLevels() {
  const [isLoading, setIsLoading] = useState(true);
  const [availablePairs, setAvailablePairs] = useState<Pair[]>([]);
  const [selectedPair, setSelectedPair] = useState<Pair>();
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [supplyCap, setSupplyCap] = useState<number | undefined>(undefined);
  const [tokenPrice, setTokenPrice] = useState<number | undefined>(undefined);
  const [parameters, setParameters] = useState(MORPHO_RISK_PARAMETERS_ARRAY[1]);
  const [selectedLTV, setSelectedLTV] = useState<string>(MORPHO_RISK_PARAMETERS_ARRAY[1].ltv.toString());
  const [selectedBonus, setSelectedBonus] = useState<number>(MORPHO_RISK_PARAMETERS_ARRAY[1].bonus);
  const pathName = useLocation().pathname;
  const navPair = pathName.split('/')[2]
    ? { base: pathName.split('/')[2].split('-')[0], quote: pathName.split('/')[2].split('-')[1] }
    : undefined;
  const navLTV = pathName.split('/')[3]
    ? pathName.split('/')[3]
    : undefined;
  const navSupplyCap = pathName.split('/')[4]
    ? Number(pathName.split('/')[4])
    : undefined;
  const navBasePrice = pathName.split('/')[5]
    ? Number(pathName.split('/')[5])
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
      setParameters(foundParam);
    }
  };

  //// useEffect to load data
  useEffect(() => {
    setIsLoading(true);
    // Define an asynchronous function
    async function fetchData() {
      try {
        const data = await DataService.GetAvailablePairs('all');
        const morphoData:OverviewData = await DataService.GetOverview();
        const morphoPairs: string[] = [];
        for (const market in morphoData) {
          morphoData[market].subMarkets.forEach(subMarket => {
                morphoPairs.push(`${market}/${subMarket.quote}`);
          });
      }
      const filteredPairs = data.filter(({ base, quote }) => morphoPairs.includes(`${base}/${quote}`));
      console.log(filteredPairs);

        setAvailablePairs(
          filteredPairs.sort((a, b) => a.base.localeCompare(b.base))
        );

        if (navPair && filteredPairs.some(({ base, quote }) => base === navPair.base && quote === navPair.quote)) {
          setSelectedPair(navPair);
          if (navLTV) {
            setSelectedLTV(navLTV);
            const foundParam = MORPHO_RISK_PARAMETERS_ARRAY.find(param => param.ltv.toString() === navLTV);
            if (foundParam) {
              setSelectedBonus(foundParam.bonus);
              setParameters(foundParam);
              if(navSupplyCap && navBasePrice) {
              setSupplyCap((navSupplyCap / navBasePrice).toFixed(0) as unknown as number);
            }
              setTokenPrice(navBasePrice);
            }
          }
        } else if (filteredPairs.length > 0) {
          const firstMarketKey = Object.keys(morphoData)[0];
          const firstMarket = morphoData[firstMarketKey];
          const firstSubMarket = firstMarket.subMarkets[0];
          const pairToSet = { base: firstMarketKey, quote: firstSubMarket.quote};
          setSelectedPair(pairToSet);
          setSelectedLTV(firstSubMarket.LTV.toString());
          setSelectedBonus(firstSubMarket.liquidationBonus);
          const foundParam = MORPHO_RISK_PARAMETERS_ARRAY.find(param => param.ltv.toString() === firstSubMarket.LTV.toString());
          setParameters(foundParam || { ltv: 0, bonus: 0, visible: false, color: "" });
          setSupplyCap(firstSubMarket.supplyCapInKind);
          setTokenPrice(firstSubMarket.quotePrice);

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
              label={`Supply Cap in ${selectedPair.quote}`}
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