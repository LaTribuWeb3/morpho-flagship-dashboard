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
import { useContext, useEffect, useState } from 'react';
import DataService from '../../services/DataService';
import { Pair } from '../../models/ApiData';
import { FriendlyFormatNumber, sleep } from '../../utils/Utils';
import { SimpleAlert } from '../../components/SimpleAlert';
import { RiskLevelGraphs, RiskLevelGraphsSkeleton } from './RiskLevelGraph';
import { MORPHO_RISK_PARAMETERS_ARRAY } from '../../utils/Constants';
import { useLocation } from 'react-router-dom';
import { OverviewData } from '../../models/OverviewData';
import { AppContext } from '../App';
import { AppContextType } from '../../models/Context';

export default function RiskLevels() {
  const [isLoading, setIsLoading] = useState(true);
  const [availablePairs, setAvailablePairs] = useState<Pair[]>([]);
  const [selectedPair, setSelectedPair] = useState<Pair>();
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [morphoData, setMorphoData] = useState<OverviewData>({});
  const [supplyCapUsd, setSupplyCapUsd] = useState<number | undefined>(undefined);
  const [supplyCapInKind, setSupplyCapInKind] = useState<number | undefined>(undefined);
  const [tokenPrice, setTokenPrice] = useState<number | undefined>(undefined);
  const [baseTokenPrice, setBaseTokenPrice] = useState<number | undefined>(undefined);
  const [parameters, setParameters] = useState(MORPHO_RISK_PARAMETERS_ARRAY[1]);
  const [selectedLTV, setSelectedLTV] = useState<string>(MORPHO_RISK_PARAMETERS_ARRAY[1].ltv.toString());
  const [selectedBonus, setSelectedBonus] = useState<number>(MORPHO_RISK_PARAMETERS_ARRAY[1].bonus);
  const { contextVariables, setContextVariables } = useContext<AppContextType>(AppContext);
  const pathName = useLocation().pathname;
  const navPair = pathName.split('/')[2]
    ? { base: pathName.split('/')[2].split('-')[0], quote: pathName.split('/')[2].split('-')[1] }
    : undefined;
  const navLTV = pathName.split('/')[3] ? pathName.split('/')[3] : undefined;
  const navSupplyCap = pathName.split('/')[4] ? Number(pathName.split('/')[4]) : undefined;
  const navBasePrice = pathName.split('/')[5] ? Number(pathName.split('/')[5]) : undefined;

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };
  const handleChangePair = (event: SelectChangeEvent) => {
    setSelectedPair({ base: event.target.value.split('/')[0], quote: event.target.value.split('/')[1] });
    const matchingSubMarket = morphoData[event.target.value.split('/')[1]].subMarkets.find(
      (subMarket) => subMarket.base === event.target.value.split('/')[0]
    );
    if (matchingSubMarket) {
      setSelectedLTV(matchingSubMarket.LTV.toString());
      setSelectedBonus(matchingSubMarket.liquidationBonus * 10000);
      setParameters({ ltv: matchingSubMarket.LTV, bonus: matchingSubMarket.liquidationBonus * 10000 });
      setSupplyCapUsd(matchingSubMarket.supplyCapUsd);
      setSupplyCapInKind(matchingSubMarket.supplyCapInKind);
      setTokenPrice(morphoData[event.target.value.split('/')[1]].loanAssetPrice);
      setContextVariables({
        riskContext: {
          current: true,
          pair: { base: event.target.value.split('/')[0], quote: event.target.value.split('/')[1] },
          LTV: matchingSubMarket.LTV,
          liquidationBonus: matchingSubMarket.liquidationBonus * 10000,
          supplyCapInLoanAsset: matchingSubMarket.supplyCapInKind,
          loanAssetPrice: morphoData[event.target.value.split('/')[1]].loanAssetPrice
        },
        datasourcesContext: contextVariables.datasourcesContext
      });
    }
  };
  const handleChangeSupplyCap = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.value) {
      setSupplyCapInKind(Number(event.target.value));
      if (tokenPrice) {
        setSupplyCapUsd(Number(event.target.value) * tokenPrice);
      }
      if (selectedPair && parameters && tokenPrice) {
        setContextVariables({
          riskContext: {
            current: true,
            pair: selectedPair,
            LTV: parameters.ltv,
            liquidationBonus: parameters.bonus,
            supplyCapInLoanAsset: Number(event.target.value),
            loanAssetPrice: tokenPrice
          },
          datasourcesContext: contextVariables.datasourcesContext
        });
      }
    }
  };
  const handleLTVChange = (event: SelectChangeEvent) => {
    setSelectedLTV(event.target.value);
    const foundParam = MORPHO_RISK_PARAMETERS_ARRAY.find((param) => param.ltv.toString() === event.target.value);
    if (foundParam) {
      setSelectedBonus(foundParam.bonus);
      setParameters(foundParam);
      if (selectedPair && supplyCapInKind && tokenPrice) {
        setContextVariables({
          riskContext: {
            current: true,
            pair: selectedPair,
            LTV: foundParam.ltv,
            liquidationBonus: foundParam.bonus,
            supplyCapInLoanAsset: supplyCapInKind,
            loanAssetPrice: tokenPrice
          },
          datasourcesContext: contextVariables.datasourcesContext
        });
      }
    }
  };

  //// useEffect to load data
  useEffect(() => {
    setIsLoading(true);
    // Define an asynchronous function
    async function fetchData() {
      try {
        const data = await DataService.GetAvailablePairs('all');
        const morphoData: OverviewData = await DataService.GetOverview();
        setMorphoData(morphoData);
        const morphoPairs: string[] = [];
        for (const market in morphoData) {
          morphoData[market].subMarkets.forEach((subMarket) => {
            morphoPairs.push(`${subMarket.base}/${market}`);
          });
        }
        const filteredPairs = data.filter(({ base, quote }) => morphoPairs.includes(`${base}/${quote}`));

        setAvailablePairs(filteredPairs.sort((a, b) => a.base.localeCompare(b.base)));
        if (navPair && filteredPairs.some(({ base, quote }) => base === navPair.base && quote === navPair.quote)) {
          setSelectedPair(navPair);
          if (navLTV) {
            setSelectedLTV(navLTV);
            const foundParam = MORPHO_RISK_PARAMETERS_ARRAY.find((param) => param.ltv.toString() === navLTV);
            if (foundParam) {
              setSelectedBonus(foundParam.bonus);
              setParameters(foundParam);
              if (navSupplyCap && navBasePrice) {
                setSupplyCapInKind(navSupplyCap);
                setSupplyCapUsd((navSupplyCap * navBasePrice).toFixed(0) as unknown as number);
                setContextVariables({
                  riskContext: {
                    current: true,
                    pair: navPair,
                    LTV: foundParam.ltv,
                    liquidationBonus: foundParam.bonus,
                    supplyCapInLoanAsset: navSupplyCap,
                    loanAssetPrice: navBasePrice
                  },
                  datasourcesContext: contextVariables.datasourcesContext
                });
              }
              setTokenPrice(navBasePrice);
              const morphoMarketForContext = morphoData[navPair.quote].subMarkets.find(_ => _.LTV == foundParam.ltv && _.base == navPair.base);
              setBaseTokenPrice(morphoMarketForContext?.basePrice);
            }
          }
        } else if (
          contextVariables.riskContext.current &&
          filteredPairs.some(
            ({ base, quote }) =>
              base === contextVariables.riskContext.pair.base && quote === contextVariables.riskContext.pair.quote
          )
        ) {
          setSelectedPair(contextVariables.riskContext.pair);
          setSelectedLTV(contextVariables.riskContext.LTV.toString());
          setSelectedBonus(contextVariables.riskContext.liquidationBonus);
          setParameters({
            ltv: contextVariables.riskContext.LTV,
            bonus: contextVariables.riskContext.liquidationBonus
          });
          setSupplyCapUsd(
            contextVariables.riskContext.supplyCapInLoanAsset * contextVariables.riskContext.loanAssetPrice
          );
          setSupplyCapInKind(contextVariables.riskContext.supplyCapInLoanAsset);
          setTokenPrice(contextVariables.riskContext.loanAssetPrice);
          let morphoMarketForContext =  morphoData[contextVariables.riskContext.pair.quote].subMarkets.find(_ => _.LTV == contextVariables.riskContext.LTV && _.base == contextVariables.riskContext.pair.base);

          if(morphoMarketForContext) {
            setBaseTokenPrice(morphoMarketForContext.basePrice);
          } else {
            morphoMarketForContext =  morphoData[contextVariables.riskContext.pair.quote].subMarkets.find(_ => _.base == contextVariables.riskContext.pair.base);
            setBaseTokenPrice(morphoMarketForContext?.basePrice);
          }
        } else if (filteredPairs.length > 0) {
          const firstMarketKey = Object.keys(morphoData)[0];
          const firstMarket = morphoData[firstMarketKey];
          const firstSubMarket = firstMarket.subMarkets[0];
          const pairToSet = { base: firstSubMarket.base, quote: firstMarketKey };
          setSelectedPair(pairToSet);
          setSelectedLTV(firstSubMarket.LTV.toString());
          setSelectedBonus(firstSubMarket.liquidationBonus * 10000);
          setParameters({ ltv: firstSubMarket.LTV, bonus: firstSubMarket.liquidationBonus * 10000 });
          setSupplyCapUsd(firstSubMarket.supplyCapUsd);
          setSupplyCapInKind(firstSubMarket.supplyCapInKind);
          setTokenPrice(morphoData[firstMarketKey].loanAssetPrice);
          setBaseTokenPrice(firstSubMarket.basePrice);
        } else {
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

  if (!selectedPair || !tokenPrice || !supplyCapUsd || !baseTokenPrice) {
    return <RiskLevelGraphsSkeleton />;
  }
  return (
    <Box sx={{ mt: 10 }}>
      {isLoading ? (
        <RiskLevelGraphsSkeleton />
      ) : (
        <Grid container spacing={1} alignItems="baseline" justifyContent="center">
          {/* First row: pairs select and slippage select */}
          <Grid
            item
            xs={8}
            sm={6}
            md={4}
            lg={3}
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1, justifyContent: 'center' }}
          >
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
          <Grid
            item
            xs={8}
            sm={6}
            md={4}
            lg={3}
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1, justifyContent: 'center' }}
          >
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
                  <MenuItem key={index} value={param.ltv.toString()}>
                    {param.ltv * 100}%
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            md={4}
            lg={3}
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1, justifyContent: 'center' }}
          >
            <TextField
              id="bonus-value"
              label="Liquidation Bonus"
              variant="outlined"
              disabled
              value={`${selectedBonus / 100}%`}
              InputProps={{
                readOnly: true // Makes the TextField read-only
              }}
            />
          </Grid>
          <Grid
            item
            xs={8}
            sm={6}
            md={4}
            lg={3}
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1, justifyContent: 'center' }}
          >
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
              value={supplyCapInKind}
              onChange={handleChangeSupplyCap}
            />
            <Typography sx={{ ml: '10px' }}>${FriendlyFormatNumber(supplyCapUsd)}</Typography>
          </Grid>
          <Grid item xs={12} lg={10}>
            <RiskLevelGraphs
              pair={selectedPair}
              parameters={parameters}
              supplyCap={supplyCapUsd}
              quotePrice={tokenPrice}
              basePrice={baseTokenPrice}
              platform={'all'}
            />
          </Grid>
        </Grid>
      )}

      <SimpleAlert alertMsg={alertMsg} handleCloseAlert={handleCloseAlert} openAlert={openAlert} />
    </Box>
  );
}
