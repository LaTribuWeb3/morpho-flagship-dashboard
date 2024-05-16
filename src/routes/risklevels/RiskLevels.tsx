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
import { useLocation } from 'react-router-dom';
import { SimpleAlert } from '../../components/SimpleAlert';
import { MORPHO_RISK_PARAMETERS_ARRAY } from '../../utils/Constants';
import { FriendlyFormatNumber, sleep } from '../../utils/Utils';
import { AppContext } from '../App';
import { RiskLevelGraphs, RiskLevelGraphsSkeleton } from './RiskLevelGraph';
import { cp } from 'fs';

export default function RiskLevels() {
  const { contextVariables, setContextVariables } = useContext(AppContext);
  const [isLoading, setLoading] = useState(false);

  const parameters = contextVariables.morphoRiskParameters;

  const [openAlert, setOpenAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
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
    contextVariables.pages.riskLevels.selectedPair = { base: event.target.value.split('/')[0], quote: event.target.value.split('/')[1] };
    const matchingSubMarket = contextVariables.overviewData[event.target.value.split('/')[1]].subMarkets.find(
      (subMarket) => subMarket.base === event.target.value.split('/')[0]
    );
    if (matchingSubMarket) {
      contextVariables.pages.riskLevels.selectedLTV = matchingSubMarket.LTV.toString();
      contextVariables.pages.riskLevels.selectedBonus = matchingSubMarket.liquidationBonus * 10000;
      contextVariables.morphoRiskParameters = { ltv: matchingSubMarket.LTV, bonus: matchingSubMarket.liquidationBonus * 10000 };
      contextVariables.pages.riskLevels.capUSD = matchingSubMarket.supplyCapUsd;
      contextVariables.pages.riskLevels.capInKind = matchingSubMarket.supplyCapInKind;
      contextVariables.pages.riskLevels.tokenPrice = contextVariables.overviewData[event.target.value.split('/')[1]].loanAssetPrice;

      updateContextWithNewRiskContext({
        current: true,
        pair: { base: event.target.value.split('/')[0], quote: event.target.value.split('/')[1] },
        LTV: matchingSubMarket.LTV,
        liquidationBonus: matchingSubMarket.liquidationBonus * 10000,
        supplyCapInLoanAsset: matchingSubMarket.supplyCapInKind,
        loanAssetPrice: contextVariables.overviewData[event.target.value.split('/')[1]].loanAssetPrice
      });
    }
  };

  const handleChangeSupplyCap = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.value) {
      contextVariables.pages.riskLevels.capInKind = Number(event.target.value);
      if (contextVariables.pages.riskLevels.tokenPrice) {
        contextVariables.pages.riskLevels.capUSD = Number(event.target.value) * contextVariables.pages.riskLevels.tokenPrice;
      }
      if (contextVariables.pages.riskLevels.selectedPair && parameters && contextVariables.pages.riskLevels.tokenPrice) {
        updateContextWithNewRiskContext({
          current: true,
          pair: contextVariables.pages.riskLevels.selectedPair,
          LTV: parameters.ltv,
          liquidationBonus: parameters.bonus,
          supplyCapInLoanAsset: Number(event.target.value),
          loanAssetPrice: contextVariables.pages.riskLevels.tokenPrice
        })
      }
    }
  };

  const handleLTVChange = (event: SelectChangeEvent) => {
    contextVariables.pages.riskLevels.selectedLTV = event.target.value;
    const foundParam = MORPHO_RISK_PARAMETERS_ARRAY.find((param) => param.ltv.toString() === event.target.value);
    if (foundParam) {
      contextVariables.pages.riskLevels.selectedBonus = foundParam.bonus;
      contextVariables.morphoRiskParameters = foundParam;
      if (contextVariables.pages.riskLevels.selectedPair
        && contextVariables.pages.riskLevels.capInKind
        && contextVariables.pages.riskLevels.tokenPrice) {
        updateContextWithNewRiskContext({
          current: true,
          pair: contextVariables.pages.riskLevels.selectedPair,
          LTV: foundParam.ltv,
          liquidationBonus: foundParam.bonus,
          supplyCapInLoanAsset: contextVariables.pages.riskLevels.capInKind,
          loanAssetPrice: contextVariables.pages.riskLevels.tokenPrice
        })
      }
    }
  };

  //// useEffect to load data
  useEffect(() => {
    setLoading(true);
    // Define an asynchronous function
    async function fetchData() {
      try {
        while (contextVariables.isDataLoading == true) {
          await sleep(1);
        }
        const morphoPairs: string[] = [];
        for (const market in contextVariables.overviewData) {
          contextVariables.overviewData[market].subMarkets.forEach((subMarket) => {
            morphoPairs.push(`${subMarket.base}/${market}`);
          });
        }
        const filteredPairs = contextVariables.availablePairs.filter(({ base, quote }) => morphoPairs.includes(`${base}/${quote}`));

        contextVariables.availablePairs = filteredPairs.sort((a, b) => a.base.localeCompare(b.base));
        if (navPair && filteredPairs.some(({ base, quote }) => base === navPair.base && quote === navPair.quote)) {
          contextVariables.pages.riskLevels.selectedPair = navPair;
          if (navLTV) {
            contextVariables.pages.riskLevels.selectedLTV = navLTV;
            const foundParam = MORPHO_RISK_PARAMETERS_ARRAY.find((param) => param.ltv.toString() === navLTV);
            if (foundParam) {
              contextVariables.pages.riskLevels.selectedBonus = foundParam.bonus;
              contextVariables.morphoRiskParameters = foundParam;
              if (navSupplyCap && navBasePrice) {
                contextVariables.pages.riskLevels.capInKind = navSupplyCap;
                contextVariables.pages.riskLevels.capUSD = (navSupplyCap * navBasePrice).toFixed(0) as unknown as number;
                contextVariables.riskContext = {
                  current: true,
                  pair: navPair,
                  LTV: foundParam.ltv,
                  liquidationBonus: foundParam.bonus,
                  supplyCapInLoanAsset: navSupplyCap,
                  loanAssetPrice: navBasePrice
                }
                contextVariables.pages.riskLevels.tokenPrice = navBasePrice;
              }
              const morphoMarketForContext = contextVariables.overviewData[navPair.quote].subMarkets.find(
                (_) => _.LTV == foundParam.ltv && _.base == navPair.base
              );
              if (morphoMarketForContext)
                contextVariables.pages.riskLevels.baseTokenPrice = morphoMarketForContext.basePrice;
            }
          }
        } else if (
          contextVariables.riskContext &&
          contextVariables.riskContext.current &&
          filteredPairs.some(
            ({ base, quote }) =>
              base === contextVariables.riskContext.pair.base && quote === contextVariables.riskContext.pair.quote
          )
        ) {
          contextVariables.pages.riskLevels.selectedPair = contextVariables.riskContext.pair;
          contextVariables.pages.riskLevels.selectedLTV = contextVariables.riskContext.LTV.toString();
          contextVariables.pages.riskLevels.selectedBonus = contextVariables.riskContext.liquidationBonus;
          contextVariables.morphoRiskParameters = {
            ltv: contextVariables.riskContext.LTV,
            bonus: contextVariables.riskContext.liquidationBonus
          };
          contextVariables.pages.riskLevels.capUSD =
            contextVariables.riskContext.supplyCapInLoanAsset * contextVariables.riskContext.loanAssetPrice;
          contextVariables.pages.riskLevels.capInKind = contextVariables.riskContext.supplyCapInLoanAsset;
          contextVariables.pages.riskLevels.tokenPrice = contextVariables.riskContext.loanAssetPrice;
          let morphoMarketForContext = contextVariables.overviewData[contextVariables.riskContext.pair.quote].subMarkets.find(
            (_) => _.LTV == contextVariables.riskContext.LTV && _.base == contextVariables.riskContext.pair.base
          );

          if (morphoMarketForContext) {
            contextVariables.pages.riskLevels.baseTokenPrice = morphoMarketForContext.basePrice;
          } else {
            morphoMarketForContext = contextVariables.overviewData[contextVariables.riskContext.pair.quote].subMarkets.find(
              (_) => _.base == contextVariables.riskContext.pair.base
            );
            if (morphoMarketForContext)
              contextVariables.pages.riskLevels.baseTokenPrice = morphoMarketForContext.basePrice;
          }
        } else if (filteredPairs.length > 0) {
          const firstMarketKey = Object.keys(contextVariables.overviewData)[0];
          const firstMarket = contextVariables.overviewData[firstMarketKey];
          const firstSubMarket = firstMarket.subMarkets[0];
          const pairToSet = { base: firstSubMarket.base, quote: firstMarketKey };
          contextVariables.pages.riskLevels.selectedPair = pairToSet;
          contextVariables.pages.riskLevels.selectedLTV = firstSubMarket.LTV.toString();
          contextVariables.pages.riskLevels.selectedBonus = firstSubMarket.liquidationBonus * 10000;
          contextVariables.morphoRiskParameters = { ltv: firstSubMarket.LTV, bonus: firstSubMarket.liquidationBonus * 10000 };
          contextVariables.pages.riskLevels.capUSD = firstSubMarket.supplyCapUsd;
          contextVariables.pages.riskLevels.capInKind = firstSubMarket.supplyCapInKind;
          contextVariables.pages.riskLevels.tokenPrice = contextVariables.overviewData[firstMarketKey].loanAssetPrice;
          if (firstSubMarket)
            contextVariables.pages.riskLevels.baseTokenPrice = firstSubMarket.basePrice;
        } else {
        }

        await sleep(1); // without this sleep, update the graph before changing the selected pair. so let it here
      } catch (error) {
        console.error('Error fetching data:', error);
        setOpenAlert(true);
        setLoading(false);
        if (error instanceof Error) {
          setAlertMsg(`Error fetching data: ${error.toString()}`);
        } else {
          setAlertMsg(`Unknown error`);
        }
      }
    }
    fetchData()
      .then(() => {
        console.log("Setting appContext.loading to false");
        setLoading(false);
      })
      .catch(console.error);
  }, [navBasePrice, navLTV, navPair, navSupplyCap, contextVariables]);

  return (
    contextVariables.isDataLoading ?
      <RiskLevelGraphsSkeleton /> :
      isLoading ? <RiskLevelGraphsSkeleton /> :
        <Box sx={{ mt: 10 }}>
          {(
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
                    value={`${contextVariables.pages.riskLevels.selectedPair.base}/${contextVariables.pages.riskLevels.selectedPair.quote}`}
                    onChange={handleChangePair}
                  >
                    {contextVariables.availablePairs.map((pair, index) => (
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
                    value={contextVariables.pages.riskLevels.selectedLTV}
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
                  value={`${contextVariables.pages.riskLevels.selectedBonus / 100}%`}
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
                  label={`Supply Cap in ${contextVariables.pages.riskLevels.selectedPair.quote}`}
                  value={contextVariables.pages.riskLevels.capInKind}
                  onChange={handleChangeSupplyCap}
                />
                <Typography sx={{ ml: '10px' }}>${FriendlyFormatNumber(contextVariables.pages.riskLevels.capUSD)}</Typography>
              </Grid>
              <Grid item xs={12} lg={10}>
                {
                  isLoading ?
                    <RiskLevelGraphsSkeleton /> :
                    <RiskLevelGraphs
                      pair={contextVariables.pages.riskLevels.selectedPair}
                      parameters={parameters}
                      supplyCap={contextVariables.pages.riskLevels.capUSD}
                      quotePrice={contextVariables.pages.riskLevels.tokenPrice}
                      basePrice={contextVariables.pages.riskLevels.baseTokenPrice}
                      platform={'all'}
                    />
                }
              </Grid>
            </Grid>
          )}

          <SimpleAlert alertMsg={alertMsg} handleCloseAlert={handleCloseAlert} openAlert={openAlert} />
        </Box>
  );

  function updateContextWithNewRiskContext(newRiskContext: { current: boolean; pair: { base: string; quote: string; }; LTV: number; liquidationBonus: number; supplyCapInLoanAsset: number; loanAssetPrice: number; }) {
    setContextVariables({
      ...contextVariables, riskContext: newRiskContext
    });
  }
}
