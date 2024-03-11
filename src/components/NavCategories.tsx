import { Divider, List, ListItemButton } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export interface NavCategoriesProperties {
  toggleDrawerFct: () => void;
}

function findDefaultNavCategory(pathName: string) {
  if (pathName.includes('datasource')) {
    return 'datasource';
  } else if (pathName.includes('risklevels')) {
    return 'risklevels';
  } else if (pathName.includes('lastupdate')) {
    return 'lastUpdate';
  } else if (pathName.includes('learn')) {
    return 'learn';
  }

  return 'overview';
}

export function NavCategories(props: NavCategoriesProperties) {
  const pathName = useLocation().pathname;
  const [selectedButton, setSelectedButton] = useState<string>(findDefaultNavCategory(pathName));

  useEffect(() => {
    setSelectedButton(findDefaultNavCategory(pathName));
  }, [pathName]);

  console.log(selectedButton);
  function handleClick(buttonName: string) {
    setSelectedButton(buttonName);
    props.toggleDrawerFct();
  }

  return (
    <List sx={{ mt: 7 }}>
      <Divider sx={{ my: 1 }} />
      <ListItemButton
        key="overview"
        sx={{
          backgroundColor: selectedButton == 'overview' ? 'primary.main' : 'background.default',
          color: selectedButton == 'overview' ? 'primary.contrastText' : 'primary.main',
          '&:hover': { backgroundColor: 'primary.main', color: 'primary.contrastText' }
        }}
        component={RouterLink}
        to="/"
        onClick={() => handleClick('overview')}
      >
        Overview
      </ListItemButton>
      <Divider sx={{ my: 1 }} />
      <ListItemButton
        key="risklevels"
        sx={{
          backgroundColor: selectedButton == 'risklevels' ? 'primary.main' : 'background.default',
          color: selectedButton == 'risklevels' ? 'primary.contrastText' : 'primary.main',
          '&:hover': { backgroundColor: 'primary.main', color: 'primary.contrastText' }
        }}
        component={RouterLink}
        to="/risklevels"
        onClick={() => handleClick('risklevels')}
      >
        Risk Levels
      </ListItemButton>
      <Divider sx={{ my: 1 }} />
      <ListItemButton
        key="datasource"
        sx={{
          backgroundColor: selectedButton == 'datasource' ? 'primary.main' : 'background.default',
          color: selectedButton == 'datasource' ? 'primary.contrastText' : 'primary.main',
          '&:hover': { backgroundColor: 'primary.main', color: 'primary.contrastText' }
        }}
        component={RouterLink}
        to="/datasource/all"
        onClick={() => handleClick('datasource')}
      >
        Datasources
      </ListItemButton>
      <Divider sx={{ my: 1 }} />

      <ListItemButton
        key="lastUpdate"
        sx={{
          backgroundColor: selectedButton == 'lastUpdate' ? 'primary.main' : 'background.default',
          color: selectedButton == 'lastUpdate' ? 'primary.contrastText' : 'primary.main',
          '&:hover': { backgroundColor: 'primary.main', color: 'primary.contrastText' }
        }}
        component={RouterLink}
        to="/lastupdate"
        onClick={() => handleClick('lastUpdate')}
      >
        Last Update
      </ListItemButton>
      <Divider sx={{ my: 1 }} />
      <ListItemButton
        key="learn"
        sx={{
          backgroundColor: selectedButton == 'learn' ? 'primary.main' : 'background.default',
          color: selectedButton == 'learn' ? 'primary.contrastText' : 'primary.main',
          '&:hover': { backgroundColor: 'primary.main', color: 'primary.contrastText' }
        }}
        component={RouterLink}
        to="/learn"
        onClick={() => handleClick('learn')}
      >
        Learn More
      </ListItemButton>
    </List>
  );
}
