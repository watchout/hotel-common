<template>
  <div class="icon-example">
    <h1>アイコンシステム使用例</h1>
    
    <section>
      <h2>基本的な使用方法</h2>
      <div class="example-row">
        <HotelIcon name="account" />
        <span>デフォルトアイコン (mdi:account)</span>
      </div>
      
      <div class="example-row">
        <HotelIcon name="calendar" set="mdi" size="lg" color="primary" />
        <span>サイズと色を指定 (mdi:calendar, lg, primary)</span>
      </div>
      
      <div class="example-row">
        <HotelIcon name="check" set="fa" size="xl" color="success" />
        <span>別のアイコンセット (fa:check, xl, success)</span>
      </div>
    </section>
    
    <section>
      <h2>システムアイコン</h2>
      <div class="example-row">
        <SystemIcon systemId="hotel-saas" size="xl" />
        <span>hotel-saas</span>
      </div>
      
      <div class="example-row">
        <SystemIcon systemId="hotel-pms" size="xl" />
        <span>hotel-pms</span>
      </div>
      
      <div class="example-row">
        <SystemIcon systemId="hotel-member" size="xl" />
        <span>hotel-member</span>
      </div>
      
      <div class="example-row">
        <SystemIcon systemId="hotel-common" size="xl" />
        <span>hotel-common</span>
      </div>
    </section>
    
    <section>
      <h2>サイズバリエーション</h2>
      <div class="example-row">
        <HotelIcon name="home" size="xs" />
        <HotelIcon name="home" size="sm" />
        <HotelIcon name="home" size="md" />
        <HotelIcon name="home" size="lg" />
        <HotelIcon name="home" size="xl" />
        <HotelIcon name="home" size="2xl" />
      </div>
      <div class="size-labels">
        <span>xs</span>
        <span>sm</span>
        <span>md</span>
        <span>lg</span>
        <span>xl</span>
        <span>2xl</span>
      </div>
    </section>
    
    <section>
      <h2>カラーバリエーション</h2>
      <div class="example-row">
        <HotelIcon name="circle" size="lg" color="primary" />
        <HotelIcon name="circle" size="lg" color="secondary" />
        <HotelIcon name="circle" size="lg" color="success" />
        <HotelIcon name="circle" size="lg" color="warning" />
        <HotelIcon name="circle" size="lg" color="error" />
        <HotelIcon name="circle" size="lg" color="info" />
      </div>
      <div class="color-labels">
        <span>primary</span>
        <span>secondary</span>
        <span>success</span>
        <span>warning</span>
        <span>error</span>
        <span>info</span>
      </div>
    </section>
    
    <section>
      <h2>機能アイコン</h2>
      <div class="feature-icons">
        <div class="feature-icon">
          <HotelIcon name="calendar" size="lg" />
          <span>予約</span>
        </div>
        <div class="feature-icon">
          <HotelIcon name="login" size="lg" />
          <span>チェックイン</span>
        </div>
        <div class="feature-icon">
          <HotelIcon name="logout" size="lg" />
          <span>チェックアウト</span>
        </div>
        <div class="feature-icon">
          <HotelIcon name="account" size="lg" />
          <span>顧客</span>
        </div>
        <div class="feature-icon">
          <HotelIcon name="bed" size="lg" />
          <span>部屋</span>
        </div>
        <div class="feature-icon">
          <HotelIcon name="cog" size="lg" />
          <span>設定</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { HotelIcon, SystemIcon } from '../index';
</script>

<style scoped>
.icon-example {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

h2 {
  color: #555;
  margin-top: 30px;
  margin-bottom: 15px;
}

section {
  margin-bottom: 30px;
}

.example-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.example-row span {
  margin-left: 15px;
}

.size-labels, .color-labels {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

.size-labels span, .color-labels span {
  width: 40px;
  text-align: center;
}

.feature-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.feature-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
}

.feature-icon span {
  margin-top: 5px;
  font-size: 14px;
}
</style>