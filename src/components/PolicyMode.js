import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper
} from '@mui/material';
import {
  Policy as PolicyIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';
import { hasNewDeployment, performAutoLogout, shouldCheckForUpdates, setLastUpdateCheck } from '../utils/updateDetection';
import UpdateProgressPopup from './UpdateProgressPopup';

function PolicyMode({ onLogout, loggedInStore, onModeChange, availableModes }) {
  const [showUpdateProgressPopup, setShowUpdateProgressPopup] = useState(false);

  // 새로운 배포 감지
  useEffect(() => {
    const checkForNewDeployment = async () => {
      // 새로운 배포가 있는지 확인
      if (shouldCheckForUpdates()) {
        const hasNew = await hasNewDeployment();
        if (hasNew) {
          console.log('새로운 배포 감지 - 자동 로그아웃 실행');
          await performAutoLogout();
          // 업데이트 진행 팝업 표시
          setShowUpdateProgressPopup(true);
          return;
        }
        setLastUpdateCheck();
      }
    };

    // 새로운 배포 체크
    checkForNewDeployment();
  }, []);

  // Service Worker 메시지 리스너
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'AUTO_LOGOUT_REQUIRED') {
          console.log('Service Worker에서 자동 로그아웃 요청 받음');
          performAutoLogout();
          setShowUpdateProgressPopup(true);
        }
      });
    }
  }, []);

  const handleBackToMain = () => {
    // 메인 화면으로 돌아가기 (모드 선택 팝업 표시)
    window.location.reload();
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={handleBackToMain} sx={{ mr: 2 }}>
            ← 뒤로가기
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            정책 모드
          </Typography>
          
          {/* 모드 전환 버튼 - 2개 이상 권한이 있는 사용자에게만 표시 */}
          {onModeChange && availableModes && availableModes.length > 1 && (
            <Button
              color="inherit"
              onClick={() => {
                console.log('PolicyMode 모드 전환 버튼 클릭됨');
                console.log('onModeChange 존재:', !!onModeChange);
                console.log('availableModes:', availableModes);
                onModeChange();
              }}
              startIcon={<SwapHorizIcon />}
              sx={{ 
                mr: 2,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              모드 변경
            </Button>
          )}
          
          <Button color="inherit" onClick={onLogout}>
            로그아웃
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: 3
          }}
        >
          <PolicyIcon sx={{ fontSize: 80, mb: 3, opacity: 0.8 }} />
          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
            정책 모드
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            준비 중입니다
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
            정책 및 규정 관련 기능이 개발 중입니다.<br />
            빠른 시일 내에 서비스를 제공하겠습니다.
          </Typography>
        </Paper>
      </Container>
      {showUpdateProgressPopup && <UpdateProgressPopup onClose={() => setShowUpdateProgressPopup(false)} />}
    </Box>
  );
}

export default PolicyMode; 