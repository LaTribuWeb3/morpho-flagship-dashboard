import { useEffect, useState } from 'react';
import { LiquidityData, Pair } from '../../models/ApiData';
import DataService from '../../services/DataService';
import { Grid, LinearProgress, Skeleton, Typography, useMediaQuery } from '@mui/material';
import { SimpleAlert } from '../../components/SimpleAlert';
import { FriendlyFormatNumber, PercentageFormatter, sleep } from '../../utils/Utils';
import moment from 'moment';
import Graph from '../../components/Graph';
export interface RiskLevelGraphsInterface {
  pair: Pair;
  platform: string;
  supplyCap: number;
  LTV: number;
  parameters: { ltv: number; bonus: number; visible: boolean };
}

export interface GraphDataAtTimestamp {
  timestamp: number;
  riskValue: number;
}

export function RiskLevelGraphsSkeleton() {
  return (
    <Grid mt={5} container spacing={0}>
      <LinearProgress color="secondary" sx={{ position: 'absolute', bottom: 5, left: 0, width: '100vw' }} />
      <Grid item xs={12}>
        <Skeleton height={500} variant="rectangular" />
      </Grid>
    </Grid>
  );
}
function findRiskLevelFromParameters(
  volatility: number,
  liquidity: number,
  liquidationBonus: number,
  ltv: number,
  borrowCap: number
) {
  const sigma = volatility;
  const d = borrowCap;
  const beta = liquidationBonus;
  const l = liquidity;

  const sigmaTimesSqrtOfD = sigma * Math.sqrt(d);
  const ltvPlusBeta = ltv + beta;
  const lnOneDividedByLtvPlusBeta = Math.log(1 / ltvPlusBeta);
  const lnOneDividedByLtvPlusBetaTimesSqrtOfL = lnOneDividedByLtvPlusBeta * Math.sqrt(l);
  const r = sigmaTimesSqrtOfD / lnOneDividedByLtvPlusBetaTimesSqrtOfL;
  return r;
}

export function RiskLevelGraphs(props: RiskLevelGraphsInterface) {
  const [liquidityData, setLiquidityData] = useState<LiquidityData>();
  const [isLoading, setIsLoading] = useState(true);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [graphData, setGraphData] = useState<GraphDataAtTimestamp[]>([]);
  const screenBigEnough = useMediaQuery('(min-width:600px)');

  const slippageBps = props.pair.base.toLowerCase() == 'wbeth' ? 700 : 800;
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  useEffect(() => {
    setIsLoading(true);
    async function fetchAndComputeDataForGraph() {
      try {
        const data = await DataService.GetLiquidityData(props.platform, props.pair.base, props.pair.quote);
        const graphData: GraphDataAtTimestamp[] = [];
        let i = 0;
        /// for each block
        if(screenBigEnough) {
        for (const [timestamp, timestampData] of Object.entries(data.liquidity)) {
          const currentBlockData: GraphDataAtTimestamp = {
            timestamp: Number(timestamp),
            riskValue: 0
          };
          if (props.parameters.visible) {
            const liquidationBonus = props.parameters.bonus * 10000;
            const liquidity = timestampData.avgSlippageMap[liquidationBonus].base;
            if (liquidity > 0) {
              const ltv = props.LTV;
              const borrowCap = props.supplyCap;
              currentBlockData.riskValue = findRiskLevelFromParameters(
                timestampData.volatility,
                liquidity,
                liquidationBonus / 10000,
                ltv,
                borrowCap
              );
            }
          }

          console.log('adding ', { currentBlockData });
          graphData.push(currentBlockData);
        }
        }
        else {
          for (const [timestamp, timestampData] of Object.entries(data.liquidity)) {
          if(!(i%4)){
            const currentBlockData: GraphDataAtTimestamp = {
              timestamp: Number(timestamp),
              riskValue: 0
            };
            if (props.parameters.visible) {
              const liquidationBonus = props.parameters.bonus * 10000;
              const liquidity = timestampData.avgSlippageMap[liquidationBonus].base;
              if (liquidity > 0) {
                const ltv = props.LTV;
                const borrowCap = props.supplyCap;
                currentBlockData.riskValue = findRiskLevelFromParameters(
                  timestampData.volatility,
                  liquidity,
                  liquidationBonus / 10000,
                  ltv,
                  borrowCap
                );
              }
            }
            console.log('adding ', { currentBlockData });
            graphData.push(currentBlockData);
          }
          i++;
        }
        }

        graphData.sort((a, b) => a.timestamp - b.timestamp);
        setGraphData(graphData);
        setLiquidityData(data);
        await sleep(1);
      } catch (error) {
        console.error('Error fetching data:', error);
        setOpenAlert(true);
        setIsLoading(false);
        if (error instanceof Error) {
          setAlertMsg(`${error.toString()}`);
        } else {
          setAlertMsg(`Unknown error`);
        }
      }
    }
    fetchAndComputeDataForGraph()
      .then(() => setIsLoading(false))
      .catch(console.error);
    // platform is not in the deps for this hooks because we only need to reload the data
    // if the pair is changing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pair.base, props.pair.quote, props.supplyCap, props.parameters, props.LTV]);

  if (!liquidityData) {
    return <RiskLevelGraphsSkeleton />;
  }

  const updated = moment(liquidityData.updated).fromNow();
  return (
    <>
      {isLoading ? (
        <RiskLevelGraphsSkeleton />
      ) : (
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Typography
              textAlign={'center'}
              mt={2}
            >{`${props.pair.base}/${props.pair.quote} risk levels over 180 days (updated ${updated})`}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Graph
              title={`${props.pair.base}/${props.pair.quote} Risk Levels`}
              xAxisData={graphData.map((_) => _.timestamp)}
              xAxisLabel="Date"
              leftYAxis={{ formatter: FriendlyFormatNumber, label: 'Risk Level'}}
              leftAxisSeries={[
                {
                  label: 'Risk Level',
                  data: graphData.map((_) => _.riskValue),
                  formatter: FriendlyFormatNumber
                }
              ]}
            />
          </Grid>

          <Grid item xs={12}>
            <Graph
              title={`${props.pair.base}/${props.pair.quote} Liquidity & Volatility`}
              xAxisData={Object.keys(liquidityData.liquidity).map((_) => Number(_))}
              xAxisLabel="Date"
              leftYAxis={{ min: 0, formatter: FriendlyFormatNumber, label:'Liquidity' }}
              leftAxisSeries={[
                {
                  label: `${props.pair.base} liquidity for ${slippageBps / 100}% slippage`,
                  data: Object.values(liquidityData.liquidity).map((_) => _.avgSlippageMap[slippageBps].base),
                  formatter: FriendlyFormatNumber
                }
              ]}
              rightYAxis={{
                min: 0,
                max: Math.max(
                  10 / 100,
                  Math.max(...Object.values(liquidityData.liquidity).map((_) => _.volatility)) * 1.1
                ),
                formatter: PercentageFormatter,
                label: 'volatility'
              }}
              rightAxisSeries={[
                {
                  label: 'volatility',
                  data: Object.values(liquidityData.liquidity).map((_) => _.volatility),
                  formatter: PercentageFormatter
                }
              ]}
            />
          </Grid>
        </Grid>
      )}

      <SimpleAlert alertMsg={alertMsg} handleCloseAlert={handleCloseAlert} openAlert={openAlert} />
    </>
  );
}
