import { Box, Divider, Grid, Link, Paper, Typography } from '@mui/material';
import { MathJax } from 'better-react-mathjax';

export default function Learn() {
  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden', padding: 2 }}>
      <Paper elevation={5} sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Risk Levels
        </Typography>
        <Typography variant="body1" gutterBottom>
          Risk Levels compare lending markets’ economic risk levels (r) over time as calculated by the&nbsp;
          <Link
            href="https://github.com/Risk-DAO/Reports/blob/main/a-smart-contract-ltv-formula.pdf"
            target="_blank"
            rel="noopener"
          >
            SmartLTV formula
          </Link>
          . Higher risk level values reflect a higher risk exposure which results from changes in market conditions
          without adjustments of LTV ratios of the market.
        </Typography>

        <Grid container justifyContent="center" sx={{ fontSize: '24px' }}>
          <MathJax>
            {
              '\\( r = \\frac{\\sigma \\cdot \\sqrt{d}}{\\ln \\left( \\frac{1}{LTV + \\beta} \\right) \\cdot \\sqrt{l}} \\)'
            }
          </MathJax>
        </Grid>
        <Typography variant="body1" gutterBottom>
          Where:
          <br /> σ - Price volatility between the collateral and debt asset.
          <br /> β - Liquidation bonus.
          <br /> l - Available dex liquidity with a slippage of β.
          <br /> d - Debt cap of the borrowable asset.
          <br /> LTV - Loan to Value ratio.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Read more
        </Typography>
        <Link
          href="https://github.com/Risk-DAO/Reports/blob/main/a-smart-contract-ltv-formula.pdf"
          target="_blank"
          rel="noopener"
        >
          SmartLTV whitepaper
        </Link>
        <br />
        <Link
          href="https://medium.com/risk-dao/a-smart-contract-formula-for-ltv-ratio-a60a8373d54d"
          target="_blank"
          rel="noopener"
        >
          SmartLTV Announcement
        </Link>
        <br />
        <Link
          href="https://medium.com/risk-dao/announcing-the-risk-level-index-ca5dcef95303"
          target="_blank"
          rel="noopener"
        >
          Risk Level Index
        </Link>
        <br />
        <Link
          href="https://medium.com/b-protocol/setting-up-risk-levels-in-metamorpho-markets-with-smartltv-7e15487a15c9"
          target="_blank"
          rel="noopener"
        >
          Calculating risk levels by SmartLTV, Morpho use case
        </Link>
      </Paper>
    </Box>
  );
}
