import { UpdateCountryRateDto } from "./shipping/dto/update-country-rate.dto";
import "reflect-metadata";
import { NextResponse } from "next/server";
import { plainToInstance, type ClassConstructor } from "class-transformer";
import { validate } from "class-validator";
import { services } from "./services";
import {
  HttpError,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "./http";
import { LoginDto } from "./auth/dto/login.dto";
import { SetupAdminDto } from "./auth/dto/setup-admin.dto";
import { CreateStaffDto } from "./auth/dto/create-staff.dto";
import { UpdateStaffDto } from "./auth/dto/update-staff.dto";
import { CreateProductDto } from "./products/dto/create-product.dto";
import { UpdateProductDto } from "./products/dto/update-product.dto";
import { ImportProductsDto } from "./products/dto/import-products.dto";
import { CreateCategoryDto } from "./products/dto/create-category.dto";
import { CreateOrderDto } from "./orders/dto/create-order.dto";
import { UpdateOrderStatusDto } from "./orders/dto/update-order-status.dto";
import { CalculateShippingDto } from "./shipping/dto/calculate-shipping.dto";
import { CreateShippingRateDto } from "./shipping/dto/create-shipping-rate.dto";
import { UpdateShippingRateDto } from "./shipping/dto/update-shipping-rate.dto";
import { UpdateSiteDto } from "./site/dto/update-site.dto";
import { CreateWholesaleRequestDto } from "./wholesale/dto/create-wholesale-request.dto";
import { UpdateWholesaleRequestDto } from "./wholesale/dto/update-wholesale-request.dto";
import { MIN_WHOLESALE_QTY } from "./wholesale/wholesale.service";
import type { AuthUser } from "./auth/auth.types";

type App = Awaited<ReturnType<typeof services>>;
type Context = {
  app: App;
  req: Request;
  id: string;
  user?: AuthUser;
  query: URLSearchParams;
};
type Access = "public" | "staff" | "admin";
type Route = {
  method: string;
  path: string;
  access: Access;
  handle: (ctx: Context) => unknown;
};

export async function readDto<T extends object>(
  req: Request,
  cls: ClassConstructor<T>,
): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestException("JSON invalide");
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new BadRequestException("Objet JSON attendu");
  const dto = plainToInstance(cls, body);
  const errors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
  });
  if (errors.length) {
    const messages = (rows: typeof errors): string[] =>
      rows.flatMap((row) => [
        ...Object.values(row.constraints || {}),
        ...messages(row.children || []),
      ]);
    throw new BadRequestException(messages(errors).join(", "));
  }
  return dto;
}

// Explicit access for every endpoint keeps admin-only actions auditable.
export const routes: Route[] = [
  {
    method: "POST",
    path: "seller/orders/:id/payment-check",
    access: "staff",
    handle: (c) => c.app.orders.findOne(c.id),
  },
  {
    method: "GET",
    path: "admin/country-rates",
    access: "admin",
    handle: (c) => c.app.countryRates.list(),
  },
  {
    method: "PUT",
    path: "admin/country-rates/:id",
    access: "admin",
    handle: async (c) =>
      c.app.countryRates.update(
        c.id,
        await readDto(c.req, UpdateCountryRateDto),
      ),
  },
  {
    method: "GET",
    path: "seller/orders/:id/history",
    access: "staff",
    handle: (c) => c.app.orders.history(c.id),
  },

  {
    method: "GET",
    path: "health",
    access: "public",
    handle: () => ({ ok: true }),
  },
  {
    method: "GET",
    path: "auth/setup",
    access: "public",
    handle: (c) => c.app.auth.setupNeeded(),
  },
  {
    method: "POST",
    path: "auth/setup",
    access: "public",
    handle: async (c) =>
      c.app.auth.setupFirstAdmin(await readDto(c.req, SetupAdminDto)),
  },
  {
    method: "POST",
    path: "auth/login",
    access: "public",
    handle: async (c) => c.app.auth.login(await readDto(c.req, LoginDto)),
  },
  { method: "GET", path: "auth/me", access: "staff", handle: (c) => c.user },
  {
    method: "GET",
    path: "staff",
    access: "admin",
    handle: (c) => c.app.auth.listStaff(),
  },
  {
    method: "POST",
    path: "staff",
    access: "admin",
    handle: async (c) =>
      c.app.auth.createStaff(await readDto(c.req, CreateStaffDto)),
  },
  {
    method: "PATCH",
    path: "staff/:id",
    access: "admin",
    handle: async (c) =>
      c.app.auth.updateStaff(
        c.id,
        await readDto(c.req, UpdateStaffDto),
        c.user!,
      ),
  },
  {
    method: "DELETE",
    path: "staff/:id",
    access: "admin",
    handle: (c) => c.app.auth.removeStaff(c.id, c.user!),
  },
  {
    method: "GET",
    path: "products",
    access: "public",
    handle: (c) => c.app.products.findAll(),
  },
  {
    method: "GET",
    path: "products/:id",
    access: "public",
    handle: async (c) => {
      const product = await c.app.products.findOne(c.id);
      if (!product) throw new NotFoundException("Produit introuvable");
      return product;
    },
  },
  {
    method: "GET",
    path: "categories",
    access: "public",
    handle: (c) => c.app.products.listCategories(),
  },
  {
    method: "POST",
    path: "orders",
    access: "public",
    handle: async (c) =>
      c.app.orders.toClient(
        await c.app.orders.create(await readDto(c.req, CreateOrderDto)),
      ),
  },
  {
    method: "GET",
    path: "orders/:id",
    access: "public",
    handle: (c) => c.app.orders.findOne(c.id),
  },
  {
    method: "POST",
    path: "orders/:id/pay",
    access: "public",
    handle: async (c) =>
      c.app.orders.toClient(await c.app.orders.retryPayment(c.id)),
  },
  {
    method: "GET",
    path: "payments/config",
    access: "public",
    handle: (c) => ({
      online: c.app.konnect.configured(),
      flouci: c.app.flouci.configured(),
    }),
  },
  {
    method: "GET",
    path: "payments/flouci/webhook",
    access: "public",
    handle: (c) => c.app.orders.confirmFlouci(c.query.get("payment_id") || ""),
  },
  {
    method: "GET",
    path: "payments/konnect/webhook",
    access: "public",
    handle: (c) =>
      c.app.orders.confirmKonnect(
        c.query.get("payment_ref") || c.query.get("paymentRef") || "",
      ),
  },
  {
    method: "POST",
    path: "payments/konnect/webhook",
    access: "public",
    handle: async (c) => {
      const body = await c.req.json().catch(() => ({}));
      const ref =
        c.query.get("payment_ref") ||
        c.query.get("paymentRef") ||
        body.paymentRef ||
        body.payment_ref ||
        "";
      if (typeof ref !== "string")
        throw new BadRequestException("Référence invalide");
      return c.app.orders.confirmKonnect(ref);
    },
  },
  {
    method: "GET",
    path: "site",
    access: "public",
    handle: (c) => c.app.site.getHome(),
  },
  {
    method: "GET",
    path: "shipping/info",
    access: "public",
    handle: (c) => c.app.shipping.info(),
  },
  {
    method: "POST",
    path: "shipping/calculate",
    access: "public",
    handle: async (c) => {
      const dto = await readDto(c.req, CalculateShippingDto);
      return c.app.shipping.quote(dto.country, dto.carrier, dto.weightKg);
    },
  },
  {
    method: "GET",
    path: "admin/shipping-rates",
    access: "admin",
    handle: (c) => c.app.shipping.listRates(),
  },
  {
    method: "POST",
    path: "admin/shipping-rates",
    access: "admin",
    handle: async (c) =>
      c.app.shipping.createRate(await readDto(c.req, CreateShippingRateDto)),
  },
  {
    method: "PUT",
    path: "admin/shipping-rates/:id",
    access: "admin",
    handle: async (c) =>
      c.app.shipping.updateRate(
        c.id,
        await readDto(c.req, UpdateShippingRateDto),
      ),
  },
  {
    method: "GET",
    path: "wholesale/config",
    access: "public",
    handle: () => ({ minQty: MIN_WHOLESALE_QTY }),
  },
  {
    method: "POST",
    path: "wholesale/requests",
    access: "public",
    handle: async (c) =>
      c.app.wholesale.create(await readDto(c.req, CreateWholesaleRequestDto)),
  },
  {
    method: "GET",
    path: "currency",
    access: "public",
    handle: (c) => c.app.currency.quote(c.query.get("country") || "TN"),
  },
  {
    method: "GET",
    path: "seller/stats",
    access: "staff",
    handle: (c) => c.app.orders.stats(),
  },
  {
    method: "GET",
    path: "seller/orders",
    access: "staff",
    handle: (c) => c.app.orders.findAll(),
  },
  {
    method: "PATCH",
    path: "seller/orders/:id",
    access: "staff",
    handle: async (c) => {
      const dto = await readDto(c.req, UpdateOrderStatusDto);
      return c.app.orders.updateStatus(c.id, dto.status, dto, c.user);
    },
  },
  {
    method: "GET",
    path: "seller/products",
    access: "staff",
    handle: (c) => c.app.products.findAllSeller(),
  },
  {
    method: "POST",
    path: "seller/products",
    access: "staff",
    handle: async (c) =>
      c.app.products.create(await readDto(c.req, CreateProductDto)),
  },
  {
    method: "POST",
    path: "seller/products/import",
    access: "staff",
    handle: async (c) =>
      c.app.products.importMany(
        (await readDto(c.req, ImportProductsDto)).products,
      ),
  },
  {
    method: "PATCH",
    path: "seller/products/:id",
    access: "staff",
    handle: async (c) =>
      c.app.products.update(c.id, await readDto(c.req, UpdateProductDto)),
  },
  {
    method: "DELETE",
    path: "seller/products/:id",
    access: "admin",
    handle: (c) => c.app.products.remove(c.id),
  },
  {
    method: "GET",
    path: "seller/categories",
    access: "staff",
    handle: (c) => c.app.products.listCategories(),
  },
  {
    method: "POST",
    path: "seller/categories",
    access: "admin",
    handle: async (c) =>
      c.app.products.createCategory(await readDto(c.req, CreateCategoryDto)),
  },
  {
    method: "DELETE",
    path: "seller/categories/:id",
    access: "admin",
    handle: (c) => c.app.products.removeCategory(c.id),
  },
  {
    method: "GET",
    path: "seller/wholesale",
    access: "staff",
    handle: (c) => c.app.wholesale.findAll(),
  },
  {
    method: "GET",
    path: "seller/wholesale/stats",
    access: "staff",
    handle: (c) => c.app.wholesale.stats(),
  },
  {
    method: "PATCH",
    path: "seller/wholesale/:id",
    access: "staff",
    handle: async (c) =>
      c.app.wholesale.update(
        c.id,
        await readDto(c.req, UpdateWholesaleRequestDto),
      ),
  },
  {
    method: "DELETE",
    path: "seller/wholesale/:id",
    access: "admin",
    handle: (c) => c.app.wholesale.remove(c.id),
  },
  {
    method: "GET",
    path: "seller/site",
    access: "staff",
    handle: (c) => c.app.site.getHome(),
  },
  {
    method: "PATCH",
    path: "seller/site",
    access: "admin",
    handle: async (c) =>
      c.app.site.updateHome(await readDto(c.req, UpdateSiteDto)),
  },
  {
    method: "POST",
    path: "seller/uploads/sign",
    access: "staff",
    handle: async (c) => c.app.uploads.signUpload(await c.req.json()),
  },
];

export async function dispatch(req: Request, segments: string[]) {
  try {
    const path = segments.join("/");
    let id = "";
    const route = routes.find((route) => {
      if (route.method !== req.method) return false;
      const parts = route.path.split("/");
      if (parts.length !== segments.length) return false;
      return parts.every((part, index) => {
        if (part === ":id") {
          id = segments[index];
          return true;
        }
        return part === segments[index];
      });
    });
    if (!route) throw new NotFoundException(`Route introuvable : ${path}`);
    // Reject unauthenticated requests before opening a database connection.
    const token = req.headers
      .get("authorization")
      ?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (route.access !== "public" && !token)
      throw new UnauthorizedException("Connecte-toi");
    const app = await services();
    let user: AuthUser | undefined;
    if (route.access !== "public") {
      user = app.auth.toPublic(await app.auth.userFromToken(token!));
      if (route.access === "admin" && user.role !== "admin")
        throw new ForbiddenException("Réservé à l’administrateur");
    }
    const result = await route.handle({
      req,
      app,
      id,
      user,
      query: new URL(req.url).searchParams,
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    if (status === 500)
      console.error(
        "API request failed",
        error instanceof Error ? error.name : "UnknownError",
      );
    return NextResponse.json(
      {
        message:
          error instanceof HttpError
            ? error.message
            : "Service temporairement indisponible",
      },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
