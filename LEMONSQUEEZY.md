# Percepta × LemonSqueezy 결제 연동 가이드

> 작성일: 2026년 1월 18일

## 1. LemonSqueezy 소개

[LemonSqueezy](https://www.lemonsqueezy.com)는 디지털 제품 판매를 위한 올인원 결제 플랫폼입니다.

### 1.1 선택 이유

| 장점 | 설명 |
|------|------|
| **간편한 연동** | 별도 사업자 등록 없이 시작 가능 |
| **글로벌 결제** | 카드, PayPal, Apple Pay 등 다양한 결제 수단 |
| **세금 자동 처리** | VAT, Sales Tax 자동 계산 및 납부 대행 |
| **Merchant of Record** | 판매자 대신 법적 판매 책임 담당 |
| **합리적 수수료** | 5% + $0.50 / 거래 |

### 1.2 수수료 구조

| 항목 | 비용 |
|------|------|
| 기본 수수료 | 5% + $0.50/거래 |
| 월 사용료 | 무료 |
| 페이아웃 수수료 | 무료 (PayPal/은행송금) |

> 예시: ₩4,000 (약 $2.76) 결제 시
> - 수수료: $2.76 × 5% + $0.50 = $0.64 (약 ₩928)
> - 순수익: 약 ₩3,072

---

## 2. 사전 준비

### 2.1 LemonSqueezy 계정 생성

1. [LemonSqueezy 가입](https://app.lemonsqueezy.com/register)
2. 이메일 인증 완료
3. 스토어 정보 입력
   - Store name: `Percepta`
   - Store URL: `percepta.lemonsqueezy.com`
   - Currency: `KRW` 또는 `USD`

### 2.2 결제 수단 연결

1. **Settings → Payments** 이동
2. Stripe 또는 PayPal 계정 연결
3. 페이아웃 계정 설정 (수익금 수령용)

### 2.3 테스트 모드 활성화

개발 중에는 반드시 테스트 모드 사용:

1. 대시보드 좌측 하단 **Test mode** 토글 활성화
2. 테스트용 API 키 생성
3. 테스트 카드: `4242 4242 4242 4242` (만료일, CVC 임의)

---

## 3. 상품 생성 (크레딧 패키지)

### 3.1 상품 구조

BM.md의 크레딧 패키지를 LemonSqueezy 상품으로 생성합니다.

| 패키지 | 크레딧 | 가격 | 상품 타입 |
|--------|--------|------|-----------|
| 기본 | 200 | ₩2,000 | Single Payment |
| 대량 | 500 | ₩4,500 | Single Payment |
| 프리미엄 | 1,000 | ₩8,000 | Single Payment |

### 3.2 상품 생성 절차

1. **Products → New product** 클릭
2. 상품 정보 입력:
   - **Name**: `크레딧 200 (기본 패키지)` 또는 `200 Credits (Basic)`
   - **Description**: `Percepta 피드백 크레딧 200개`
   - **Pricing**: `Single payment` 선택
   - **Price**: `₩2,000` 또는 `$1.40`
3. **Variants** 섹션에서 기본 variant 확인
4. **Save** 후 **Variant ID** 메모

### 3.3 상품별 Variant ID 관리

생성된 각 상품의 Variant ID를 기록합니다:

```env
# .env 예시
LEMON_VARIANT_CREDITS_200=123456
LEMON_VARIANT_CREDITS_500=123457
LEMON_VARIANT_CREDITS_1000=123458
```

---

## 4. API 설정

### 4.1 API 키 발급

1. **Settings → API** 이동
2. **Create API key** 클릭
3. 키 이름: `Percepta Backend`
4. 생성된 키를 안전하게 보관 (한 번만 표시됨)

### 4.2 Store ID 확인

1. **Settings → General** 이동
2. URL에서 Store ID 확인: `https://app.lemonsqueezy.com/stores/12345`
3. 또는 API 호출로 확인

### 4.3 환경 변수 설정

`backend/.env`에 추가:

```env
# LemonSqueezy
LEMON_API_KEY=your_api_key_here
LEMON_STORE_ID=12345
LEMON_WEBHOOK_SECRET=your_webhook_secret_here

# Variant IDs (크레딧 패키지)
LEMON_VARIANT_CREDITS_200=123456
LEMON_VARIANT_CREDITS_500=123457
LEMON_VARIANT_CREDITS_1000=123458
```

---

## 5. 백엔드 연동 (NestJS)

### 5.1 SDK 설치

```bash
pnpm --filter backend add @lemonsqueezy/lemonsqueezy.js
```

### 5.2 Payment 모듈 생성

```bash
cd backend
nest g module modules/payment
nest g controller modules/payment
nest g service modules/payment
```

### 5.3 Payment Service 구현

`backend/src/modules/payment/payment.service.ts`:

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  lemonSqueezySetup,
  createCheckout,
  getOrder,
} from '@lemonsqueezy/lemonsqueezy.js';

interface CreditPackage {
  credits: number;
  variantId: string;
  price: number;
}

@Injectable()
export class PaymentService {
  private readonly storeId: string;
  private readonly packages: Map<string, CreditPackage>;

  constructor(private configService: ConfigService) {
    // SDK 초기화
    lemonSqueezySetup({
      apiKey: this.configService.get('LEMON_API_KEY'),
    });

    this.storeId = this.configService.get('LEMON_STORE_ID');

    // 크레딧 패키지 설정
    this.packages = new Map([
      ['credits_200', { credits: 200, variantId: this.configService.get('LEMON_VARIANT_CREDITS_200'), price: 2000 }],
      ['credits_500', { credits: 500, variantId: this.configService.get('LEMON_VARIANT_CREDITS_500'), price: 4500 }],
      ['credits_1000', { credits: 1000, variantId: this.configService.get('LEMON_VARIANT_CREDITS_1000'), price: 8000 }],
    ]);
  }

  /**
   * 체크아웃 URL 생성
   */
  async createCheckoutUrl(
    userId: string,
    userEmail: string,
    packageId: string,
  ): Promise<{ checkoutUrl: string }> {
    const pkg = this.packages.get(packageId);
    if (!pkg) {
      throw new BadRequestException('Invalid package ID');
    }

    const response = await createCheckout(this.storeId, pkg.variantId, {
      checkoutData: {
        email: userEmail,
        custom: {
          user_id: userId,
          package_id: packageId,
          credits: pkg.credits.toString(),
        },
      },
      productOptions: {
        redirectUrl: `${this.configService.get('FRONTEND_URL')}/payment/success`,
      },
    });

    if (response.error) {
      throw new BadRequestException(response.error.message);
    }

    return {
      checkoutUrl: response.data.data.attributes.url,
    };
  }

  /**
   * 주문 정보 조회
   */
  async getOrderDetails(orderId: string) {
    const response = await getOrder(orderId);

    if (response.error) {
      throw new BadRequestException(response.error.message);
    }

    return response.data;
  }

  /**
   * 사용 가능한 패키지 목록
   */
  getAvailablePackages() {
    return Array.from(this.packages.entries()).map(([id, pkg]) => ({
      id,
      credits: pkg.credits,
      price: pkg.price,
      priceFormatted: `₩${pkg.price.toLocaleString()}`,
    }));
  }
}
```

### 5.4 Webhook 처리

`backend/src/modules/payment/payment.controller.ts`:

```typescript
import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

interface WebhookPayload {
  meta: {
    event_name: string;
    custom_data: {
      user_id: string;
      package_id: string;
      credits: string;
    };
  };
  data: {
    id: string;
    attributes: {
      status: string;
      total: number;
      total_formatted: string;
    };
  };
}

@Controller('api/payment')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  /**
   * 사용 가능한 크레딧 패키지 목록
   */
  @Get('packages')
  getPackages() {
    return this.paymentService.getAvailablePackages();
  }

  /**
   * 체크아웃 URL 생성
   */
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @CurrentUser() user: User,
    @Body('packageId') packageId: string,
  ) {
    return this.paymentService.createCheckoutUrl(
      user.id,
      user.email,
      packageId,
    );
  }

  /**
   * LemonSqueezy Webhook 처리
   */
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
  ) {
    // 1. 서명 검증
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    const secret = this.configService.get('LEMON_WEBHOOK_SECRET');
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(rawBody).digest('hex');

    if (signature !== digest) {
      throw new BadRequestException('Invalid signature');
    }

    // 2. 페이로드 파싱
    const payload: WebhookPayload = JSON.parse(rawBody.toString());
    const eventName = payload.meta.event_name;

    // 3. 이벤트 처리
    switch (eventName) {
      case 'order_created':
        await this.handleOrderCreated(payload);
        break;
      case 'order_refunded':
        await this.handleOrderRefunded(payload);
        break;
      default:
        console.log(`Unhandled event: ${eventName}`);
    }

    return { received: true };
  }

  /**
   * 주문 생성 처리 - 크레딧 충전
   */
  private async handleOrderCreated(payload: WebhookPayload) {
    const { user_id, credits } = payload.meta.custom_data;
    const creditsToAdd = parseInt(credits, 10);

    if (!user_id || isNaN(creditsToAdd)) {
      console.error('Invalid webhook data:', payload.meta.custom_data);
      return;
    }

    // 사용자 크레딧 충전
    await this.usersService.addCredits(user_id, creditsToAdd);

    console.log(`Added ${creditsToAdd} credits to user ${user_id}`);
  }

  /**
   * 환불 처리 - 크레딧 차감
   */
  private async handleOrderRefunded(payload: WebhookPayload) {
    const { user_id, credits } = payload.meta.custom_data;
    const creditsToRemove = parseInt(credits, 10);

    if (!user_id || isNaN(creditsToRemove)) {
      console.error('Invalid webhook data:', payload.meta.custom_data);
      return;
    }

    // 사용자 크레딧 차감 (음수 방지)
    await this.usersService.deductCredits(user_id, creditsToRemove);

    console.log(`Removed ${creditsToRemove} credits from user ${user_id}`);
  }
}
```

### 5.5 Raw Body 파싱 설정

`backend/src/main.ts` 수정:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Raw body 활성화
  });

  // Webhook용 raw body 파싱
  app.use(
    '/api/payment/webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  // 기타 설정...
  await app.listen(3000);
}
bootstrap();
```

### 5.6 Users Service 크레딧 메서드 추가

`backend/src/modules/users/users.service.ts`에 추가:

```typescript
async addCredits(userId: string, amount: number): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  user.credits += amount;
  return this.userRepository.save(user);
}

async deductCredits(userId: string, amount: number): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  user.credits = Math.max(0, user.credits - amount);
  return this.userRepository.save(user);
}
```

---

## 6. 프론트엔드 연동

### 6.1 결제 API 클라이언트

`frontend/src/api/payment.ts`:

```typescript
import { apiClient } from './client';

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  priceFormatted: string;
}

export const paymentApi = {
  // 패키지 목록 조회
  getPackages: async (): Promise<CreditPackage[]> => {
    const response = await apiClient.get('/payment/packages');
    return response.data;
  },

  // 체크아웃 URL 생성
  createCheckout: async (packageId: string): Promise<{ checkoutUrl: string }> => {
    const response = await apiClient.post('/payment/checkout', { packageId });
    return response.data;
  },
};
```

### 6.2 크레딧 충전 페이지

`frontend/src/pages/CreditsPage.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { paymentApi, CreditPackage } from '../api/payment';
import { useAuth } from '../hooks/useAuth';

export function CreditsPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    paymentApi.getPackages().then(setPackages);
  }, []);

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId);
    try {
      const { checkoutUrl } = await paymentApi.createCheckout(packageId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('결제 페이지 생성에 실패했습니다.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">크레딧 충전</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-8">
        <p className="text-lg">
          현재 보유 크레딧: <span className="font-bold">{user?.credits ?? 0}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="border rounded-lg p-6 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-2">
              {pkg.credits} 크레딧
            </h3>
            <p className="text-2xl font-bold text-blue-600 mb-4">
              {pkg.priceFormatted}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              크레딧당 ₩{(pkg.price / pkg.credits).toFixed(1)}
            </p>
            <button
              onClick={() => handlePurchase(pkg.id)}
              disabled={loading === pkg.id}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading === pkg.id ? '처리 중...' : '구매하기'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6.3 결제 성공 페이지

`frontend/src/pages/PaymentSuccessPage.tsx`:

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    // 사용자 정보 새로고침하여 크레딧 업데이트
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <div className="text-6xl mb-4">✓</div>
      <h1 className="text-2xl font-bold mb-4">결제 완료</h1>
      <p className="text-gray-600 mb-8">
        크레딧이 성공적으로 충전되었습니다.
      </p>
      <button
        onClick={() => navigate('/feedback')}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
      >
        피드백 받으러 가기
      </button>
    </div>
  );
}
```

---

## 7. Webhook 설정

### 7.1 로컬 개발 환경 (ngrok)

로컬에서 웹훅을 테스트하려면 ngrok 사용:

```bash
# ngrok 설치
brew install ngrok  # macOS

# 터널 생성
ngrok http 3000
```

생성된 URL을 웹훅 엔드포인트로 사용:
```
https://abc123.ngrok.io/api/payment/webhook
```

### 7.2 LemonSqueezy 웹훅 등록

1. **Settings → Webhooks** 이동
2. **Add webhook** 클릭
3. 설정:
   - **URL**: `https://your-domain.com/api/payment/webhook`
   - **Secret**: 강력한 시크릿 생성 후 `.env`에 저장
   - **Events**:
     - `order_created` ✓
     - `order_refunded` ✓
4. **Save** 클릭

### 7.3 웹훅 테스트 (테스트 모드)

1. 테스트 모드에서 상품 구매 진행
2. 테스트 카드: `4242 4242 4242 4242`
3. 대시보드 **Webhooks → Recent deliveries**에서 전송 확인
4. 백엔드 로그에서 크레딧 충전 확인

---

## 8. 프로덕션 배포

### 8.1 체크리스트

- [ ] 라이브 모드 API 키 발급
- [ ] 라이브 모드 상품 생성 (또는 복제)
- [ ] 프로덕션 웹훅 URL 등록
- [ ] 환경 변수 업데이트
- [ ] HTTPS 적용 확인
- [ ] 에러 로깅/모니터링 설정

### 8.2 환경 변수 분리

```env
# Production .env
LEMON_API_KEY=live_xxxxxxxxxx
LEMON_STORE_ID=12345
LEMON_WEBHOOK_SECRET=whsec_xxxxxxxxxx

# Production Variant IDs
LEMON_VARIANT_CREDITS_200=prod_123456
LEMON_VARIANT_CREDITS_500=prod_123457
LEMON_VARIANT_CREDITS_1000=prod_123458
```

### 8.3 테스트 모드 → 라이브 모드 전환

1. 대시보드에서 테스트 모드 비활성화
2. 라이브 모드 API 키 사용
3. 실제 결제 테스트 (소액)
4. 환불 처리 테스트

---

## 9. 모니터링 및 분석

### 9.1 LemonSqueezy 대시보드

- **Orders**: 모든 주문 내역
- **Revenue**: 매출 분석
- **Customers**: 고객 관리

### 9.2 애플리케이션 로깅

주요 이벤트 로깅 추가:

```typescript
// payment.service.ts
import { Logger } from '@nestjs/common';

private readonly logger = new Logger(PaymentService.name);

async handleOrderCreated(payload: WebhookPayload) {
  this.logger.log(`Order created: ${payload.data.id}`);
  this.logger.log(`User: ${payload.meta.custom_data.user_id}`);
  this.logger.log(`Credits: ${payload.meta.custom_data.credits}`);
  // ...
}
```

---

## 10. 트러블슈팅

### 10.1 웹훅이 도착하지 않음

1. 엔드포인트 URL 확인 (HTTPS 필수)
2. 방화벽/보안 그룹 확인
3. LemonSqueezy 대시보드에서 전송 로그 확인
4. ngrok 사용 시 터널 활성 상태 확인

### 10.2 서명 검증 실패

1. `LEMON_WEBHOOK_SECRET` 값 확인
2. Raw body 파싱 설정 확인
3. 미들웨어 순서 확인 (raw body 파싱이 먼저)

### 10.3 크레딧이 충전되지 않음

1. 웹훅 페이로드에서 `custom_data` 확인
2. `user_id`가 올바르게 전달되는지 확인
3. 데이터베이스 트랜잭션 로그 확인

---

## 11. 참고 자료

### 공식 문서
- [LemonSqueezy API Reference](https://docs.lemonsqueezy.com/api)
- [Taking Payments Guide](https://docs.lemonsqueezy.com/guides/developer-guide/taking-payments)
- [Webhooks Guide](https://docs.lemonsqueezy.com/guides/developer-guide/webhooks)
- [Webhook Requests](https://docs.lemonsqueezy.com/help/webhooks/webhook-requests)

### SDK
- [Official JS SDK](https://github.com/lmsqueezy/lemonsqueezy.js) - `@lemonsqueezy/lemonsqueezy.js`

### 커뮤니티
- [LemonSqueezy Discord](https://discord.gg/lemonsqueezy)
- [GitHub Topics: lemonsqueezy](https://github.com/topics/lemonsqueezy)

---

## 부록: API 엔드포인트 요약

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/api/payment/packages` | 크레딧 패키지 목록 | 불필요 |
| POST | `/api/payment/checkout` | 체크아웃 URL 생성 | JWT |
| POST | `/api/payment/webhook` | LemonSqueezy 웹훅 | Signature |
