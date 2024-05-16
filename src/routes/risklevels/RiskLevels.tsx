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
import { FriendlyFormatNumber } from '../../utils/Utils';
import { AppContext } from '../App';
import { RiskLevelGraphs, RiskLevelGraphsSkeleton } from './RiskLevelGraph';

export default function RiskLevels() {
  const { contextVariables, setContextVariables } = useContext(AppContext);
  const [isLoading, setLoading] = useState(false);

  const parameters = contextVariables.morphoRiskParameters;

  const [openAlert, setOpenAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const pathName = useLocation().pathname;

  useEffect(() => {
    const navPair = pathName.split('/')[2]
      ? { base: pathName.split('/')[2].split('-')[0], quote: pathName.split('/')[2].split('-')[1] }
      : undefined;
    const navLTV = pathName.split('/')[3] ? pathName.split('/')[3] : undefined;
    const navSupplyCap = pathName.split('/')[4] ? Number(pathName.split('/')[4]) : undefined;
    const navBasePrice = pathName.split('/')[5] ? Number(pathName.split('/')[5]) : undefined;

    if (navPair && navLTV && navSupplyCap && navBasePrice) {
      contextVariables.pages.riskLevels.selectedPair = navPair;
      contextVariables.pages.riskLevels.selectedLTV = navLTV;
      contextVariables.pages.riskLevels.capInKind = navSupplyCap;
      contextVariables.pages.riskLevels.capUSD = (navSupplyCap * navBasePrice).toFixed(0) as unknown as number;
      setContextVariables({ ...contextVariables });
    }
  })

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
                    {contextVariables.pages.riskLevels.availablePairs.map((pair, index) => (
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
