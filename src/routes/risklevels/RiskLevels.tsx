import { Box, Grid, InputAdornment, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import DataService from '../../services/DataService';
import { Pair } from '../../models/ApiData';
import { FriendlyFormatNumber, sleep } from '../../utils/Utils';
import { SimpleAlert } from '../../components/SimpleAlert';
import { RiskLevelGraphs, RiskLevelGraphsSkeleton } from './RiskLevelGraph';
import { KinzaRiskParameter, KinzaRiskParameters } from '../../models/RiskData';
import { useLocation } from 'react-router-dom';

export default function RiskLevels() {
  const [isLoading, setIsLoading] = useState(true);
  const [availablePairs, setAvailablePairs] = useState<Pair[]>([]);
  const [selectedPair, setSelectedPair] = useState<Pair>();
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [capUSD, setCapUSD] = useState<number>(0);
  const [capInKind, setCapInKind] = useState<number | undefined>(undefined);
  const [tokenPrice, setTokenPrice] = useState<number | undefined>(undefined);
  const [parameters, setParameters] = useState<KinzaRiskParameters | undefined>(undefined);
  const [riskParameter, setRiskParameter] = useState<KinzaRiskParameter | undefined>(undefined);
  const [LTV, setLTV] = useState<number | undefined>(undefined);
  const pathName = useLocation().pathname;
  const navPair = pathName.split('/')[2]
    ? { base: pathName.split('/')[2].split('-')[0], quote: pathName.split('/')[2].split('-')[1] }
    : undefined;

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };
  const handleChangePair = (event: SelectChangeEvent) => {
    console.log(`handleChangePair: ${event.target.value}`);
    const base = event.target.value.split('/')[0];
    const quote = event.target.value.split('/')[1];
    setSelectedPair({ base: base, quote: quote });
    if (parameters) {
      setRiskParameter(parameters[base][quote]);
    }
  };
  const handleChangeCap = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.value && tokenPrice) {
      setCapInKind(Number(event.target.value));
      setCapUSD(Number(event.target.value) * tokenPrice);
    }
  };
  const handleChangeLTV = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.value) {
      const newLTV = Number(event.target.value);
      if (newLTV >= 1 && newLTV < 100 - riskParameter!.bonus * 100) {
        setLTV(newLTV);
      }
    }
  };

  //// useEffect to load data
  useEffect(() => {
    setIsLoading(true);
    // Define an asynchronous function
    async function fetchData() {
      try {
        const overviewData = await DataService.GetOverview();
        const kinzaRiskParameters = {} as KinzaRiskParameters;
        Object.keys(overviewData).forEach((symbol) => {
          const riskLevelData = overviewData[symbol];
          kinzaRiskParameters[symbol] = {};
          riskLevelData.subMarkets.forEach((subMarket) => {
            // Ensure the subMarket's quote does not already exist for robustness
            if (!kinzaRiskParameters[symbol][subMarket.quote]) {
              kinzaRiskParameters[symbol][subMarket.quote] = {
                ltv: subMarket.LTV,
                bonus: subMarket.liquidationBonus,
                visible: true, // Set all to true as per instruction
                supplyCapInUSD: subMarket.supplyCapUsd,
                borrowCapInUSD: subMarket.borrowCapUsd,
                basePrice: subMarket.basePrice
              };
            }
          });
        });
        setParameters(kinzaRiskParameters);
        const data = [];
        for (const symbol of Object.keys(overviewData)) {
          for (const subMarket of overviewData[symbol].subMarkets) {
            data.push({ base: symbol, quote: subMarket.quote });
          }
        }
        setAvailablePairs(data.sort((a, b) => a.base.localeCompare(b.base)));

        if (navPair && data.some((_) => _.base == navPair.base && _.quote == navPair.quote)) {
          setSelectedPair(navPair);
        } else {
          setSelectedPair(data[0]);
        }
        const pairSet = navPair ? navPair : data[0];
        setRiskParameter(kinzaRiskParameters[pairSet.base][pairSet.quote]);
        setLTV(kinzaRiskParameters[pairSet.base][pairSet.quote].ltv * 100);
        const capUSDToSet = Math.min(
          kinzaRiskParameters[pairSet.base][pairSet.quote].supplyCapInUSD,
          kinzaRiskParameters[pairSet.base][pairSet.quote].borrowCapInUSD
        );
        setCapUSD(capUSDToSet);
        const capInKindToSet = capUSDToSet / kinzaRiskParameters[pairSet.base][pairSet.quote].basePrice;
        setCapInKind(capInKindToSet);

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
        const maxBlock = liquidityObjectToArray.at(-1)!.toString();
        const tokenPrice = data.liquidity[maxBlock].priceMedian;

        if (selectedPair && capInKind && tokenPrice && parameters) {
          const capUSDToSet = Math.min(
            parameters[selectedPair.base][selectedPair.quote].supplyCapInUSD,
            parameters[selectedPair.base][selectedPair.quote].borrowCapInUSD
          );
          setCapUSD(capUSDToSet);

          const capInKindToSet = capUSDToSet / parameters[selectedPair.base][selectedPair.quote].basePrice;
          setTokenPrice(parameters[selectedPair.base][selectedPair.quote].basePrice);

          setCapInKind(Number(capInKindToSet.toFixed(2)));
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

  if (!selectedPair || !tokenPrice || !capInKind) {
    return <RiskLevelGraphsSkeleton />;
  }
  return (
    <Box sx={{ mt: 10 }}>
      {isLoading || !riskParameter || !LTV ? (
        <RiskLevelGraphsSkeleton />
      ) : (
        <Grid container spacing={1} alignItems="baseline" justifyContent='center'>
          {/* First row: pairs select and slippage select */}
          <Grid item xs={8} sm={6} md={4} lg={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography textAlign={'right'}>Pair: </Typography>
            <Select
              sx={{ width: '95%' }}
              labelId="pair-select"
              id="pair-select"
              value={`${selectedPair.base}/${selectedPair.quote}`}
              label="Pair"
              onChange={handleChangePair}
            >
              {availablePairs.map((pair, index) => (
                <MenuItem key={index} value={`${pair.base}/${pair.quote}`}>
                  {`${pair.base}/${pair.quote}`}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={0} lg={1} sx={{ marginTop: '20px' }} />
          <Grid item xs={8} sm={6} md={4} lg={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography textAlign={'right'}>LTV: </Typography>
            <TextField
              sx={{
                width: '95%',
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                  display: 'none'
                },
                '& input[type=number]': {
                  MozAppearance: 'textfield'
                }
              }}
              required
              id="ltv-input"
              type="number"
              label={`Must be < ${100 - riskParameter.bonus * 100}%`}
              onChange={handleChangeLTV}
              value={LTV}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={0} lg={1} sx={{ marginTop: '20px' }} />
          <Grid item xs={8} sm={6} md={4} lg={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography textAlign={'right'}>Cap: </Typography>
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
              label={selectedPair.base}
              value={capInKind}
              onChange={handleChangeCap}
            />
            <Typography sx={{ ml: '10px' }}>${FriendlyFormatNumber(capUSD)}</Typography>
          </Grid>
          <Grid item xs={12} lg={12}>
            <RiskLevelGraphs
              pair={selectedPair}
              parameters={riskParameter}
              LTV={LTV / 100}
              supplyCap={capInKind}
              platform={'all'}
            />
          </Grid>
        </Grid>
      )}

      <SimpleAlert alertMsg={alertMsg} handleCloseAlert={handleCloseAlert} openAlert={openAlert} />
    </Box>
  );
}
