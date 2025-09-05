import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { ProjectProvider } from '../context/ProjectContext.jsx';
import BookDashboard from '../components/dashboard/BookDashboard.jsx';
import GameDashboard from '../components/dashboard/GameDashboard.jsx';
import SeriesDashboard from '../components/dashboard/SeriesDashboard.jsx';
import { booksAPI, gamesAPI, moviesAPI } from '../services/api.js';

// Utility: compute average rating exactly as dashboards do (only > 0, toFixed(1), fallback '0')
const calcAverageString = (items) => {
  const rated = items.filter((i) => (i.rating || 0) > 0);
  if (rated.length === 0) return '0';
  const avg = rated.reduce((sum, i) => sum + Number(i.rating || 0), 0) / rated.length;
  return avg.toFixed(1);
};

// Yardımcı: Dashboard'da data-testid="average-rating-value" olan değeri bulur
const getAverageValueFromUI = async () => {
  const valueEl = await screen.findByTestId('average-rating-value');
  const valueText = valueEl?.textContent?.trim();
  if (!valueText) throw new Error('Dashboardda Ortalama Puan değeri bulunamadı');
  return valueText;
};

describe('Dashboard Average Rating Integration (API → UI)', () => {
  afterEach(async () => {
    cleanup();
  });

  test('Books Dashboard - Ortalama Puan updates after adding rated books via API', async () => {
  // Given: Mevcut kitaplar ve ortalama puanları (API'den alınır)
    const beforeResp = await booksAPI.getAll();
    const beforeItems = beforeResp.data || [];
    const beforeAvg = calcAverageString(beforeItems);

  // When: Dashboard'ı render et ve ilk "Ortalama Puan" değerinin backend ile aynı olduğunu doğrula
    const { unmount } = render(
      <ProjectProvider>
        <BookDashboard />
      </ProjectProvider>
    );

  // Then: UI'da ilk değer doğru gösteriliyor mu?
    await waitFor(async () => {
      const uiAvg = await getAverageValueFromUI();
      expect(uiAvg).toBe(beforeAvg);
    });

  // Given: Ortalama puanı değiştirecek iki yeni puanlı kitap ekle (gerçek API ile)
    const b1 = {
      title: `Avg Test Book A`,
      genre: 'Roman',
      status: 'completed',
      rating: Number(beforeAvg) + 1,
      author: 'Integration Tester'
    };
    const b2 = {
      title: `Avg Test Book B`,
      genre: 'Roman',
      status: 'completed',
      rating: Number(beforeAvg) + 3,
      author: 'Integration Tester'
    };
    
    const created = [];
    try {
      const c1 = await booksAPI.create(b1);
      const c2 = await booksAPI.create(b2);
      created.push(c1.data?._id);
      created.push(c2.data?._id);

  // When: Backend'den güncel veriyi tekrar çek ve dashboard'ı yeniden render et
      const afterResp = await booksAPI.getAll();
      const afterItems = afterResp.data || [];
      const afterAvg = calcAverageString(afterItems);

      unmount();
      render(
        <ProjectProvider>
          <BookDashboard />
        </ProjectProvider>
      );

  // Then: UI'da güncellenmiş ortalama puan doğru gösteriliyor mu?
      await waitFor(async () => {
        const uiAvgAfter = await getAverageValueFromUI();
        expect(uiAvgAfter).toBe(afterAvg);
        expect(afterAvg).not.toBe(beforeAvg);
      });
    } finally {
  // Temizlik: Oluşturulan kayıtları sil (veritabanı temiz kalsın)
      await Promise.all(
        created
          .filter(Boolean)
          .map((id) => booksAPI.delete(id).catch(() => {}))
      );
    }
  });

  test('Games Dashboard - Ortalama Puan updates after adding rated games via API', async () => {
  // Given: Mevcut oyunlar ve ortalama puanları (API'den alınır)
    const beforeResp = await gamesAPI.getAll();
    const beforeItems = beforeResp.data || [];
    const beforeAvg = calcAverageString(beforeItems);

  // When: Dashboard'ı render et ve ilk "Ortalama Puan" değerinin backend ile aynı olduğunu doğrula
    const { unmount } = render(
      <ProjectProvider>
        <GameDashboard />
      </ProjectProvider>
    );

  // Then: UI'da ilk değer doğru gösteriliyor mu?
    await waitFor(async () => {
      const uiAvg = await getAverageValueFromUI();
      expect(uiAvg).toBe(beforeAvg);
    });

  // Given: Ortalama puanı değiştirecek iki yeni puanlı oyun ekle (gerçek API ile)
    const g1 = {
      title: `Avg Test Game A`,
      genre: 'RPG',
      status: 'completed',
      rating: Number(beforeAvg) + 1,
      platform: 'PC'
    };
    const g2 = {
      title: `Avg Test Game B`,
      genre: 'RPG',
      status: 'completed',
      rating: Number(beforeAvg) + 3,
      platform: 'PC'
    };
    
    const created = [];
    try {
      const c1 = await gamesAPI.create(g1);
      created.push(c1.data?._id);
      const c2 = await gamesAPI.create(g2);
      created.push(c2.data?._id);

      const afterResp = await gamesAPI.getAll();
      const afterItems = afterResp.data || [];
      const afterAvg = calcAverageString(afterItems);

      unmount();
      render(
        <ProjectProvider>
          <GameDashboard />
        </ProjectProvider>
      );

    // Then: UI'da güncellenmiş ortalama puan doğru gösteriliyor mu?
      await waitFor(async () => {
        const uiAvgAfter = await getAverageValueFromUI();
        expect(uiAvgAfter).toBe(afterAvg);
        expect(afterAvg).not.toBe(beforeAvg);
      });
    } finally {
  // Temizlik: Oluşturulan kayıtları sil (veritabanı temiz kalsın)
      await Promise.all(
        created
          .filter(Boolean)
          .map((id) => gamesAPI.delete(id).catch(() => {}))
      );
    }
  });

  test('Series Dashboard - Ortalama Puan updates after adding rated movies via API', async () => {
  // Given: Mevcut filmler ve ortalama puanları (API'den alınır)
    const beforeResp = await moviesAPI.getAll();
    const beforeItems = beforeResp.data || [];
    const beforeAvg = calcAverageString(beforeItems);

  // When: Dashboard'ı render et ve ilk "Ortalama Puan" değerinin backend ile aynı olduğunu doğrula
    const { unmount } = render(
      <ProjectProvider>
        <SeriesDashboard />
      </ProjectProvider>
    );

  // Then: UI'da ilk değer doğru gösteriliyor mu?
    await waitFor(async () => {
      const uiAvg = await getAverageValueFromUI();
      expect(uiAvg).toBe(beforeAvg);
    });

  // Given: Ortalama puanı değiştirecek iki yeni puanlı film ekle (gerçek API ile)
    const m1 = {
      title: `Avg Test Movie A`,
      genre: 'Aksiyon',
      status: 'completed',
      rating: Number(beforeAvg) + 1,
      director: 'Integration Tester'
    };
    const m2 = {
      title: `Avg Test Movie B`,
      genre: 'Aksiyon',
      status: 'completed',
      rating: Number(beforeAvg) + 3,
      director: 'Integration Tester'
    };

    const created = [];
    try {
      const c1 = await moviesAPI.create(m1);
      created.push(c1.data?._id);
      const c2 = await moviesAPI.create(m2);
      created.push(c2.data?._id);

      const afterResp = await moviesAPI.getAll();
      const afterItems = afterResp.data || [];
      const afterAvg = calcAverageString(afterItems);


      unmount();
      // Chart.js ve jsdom çakışmasını önlemek için kısa bir bekleme ekle
      await Promise.resolve();
      render(
        <ProjectProvider>
          <SeriesDashboard />
        </ProjectProvider>
      );

  // Then: UI'da güncellenmiş ortalama puan doğru gösteriliyor mu?
      await waitFor(async () => {
        const uiAvgAfter = await getAverageValueFromUI();
        expect(uiAvgAfter).toBe(afterAvg);
        expect(afterAvg).not.toBe(beforeAvg);
      });
    } finally {
  // Temizlik: Oluşturulan kayıtları sil (veritabanı temiz kalsın)
      await Promise.all(
        created
          .filter(Boolean)
          .map((id) => moviesAPI.delete(id).catch(() => {}))
      );
    }
  });
});
