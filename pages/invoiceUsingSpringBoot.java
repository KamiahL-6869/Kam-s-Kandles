package app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@SpringBootApplication // configures the app
@RestController // makes this class handle web requests. Its methods return response bodies directly.
public class Main {

    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }

    @GetMapping(value = "/", produces = "text/html")
    public String home() {
        return """
            <!doctype html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Invoice INV-1001</title>
              <style>
                * { box-sizing: border-box; }
                body { margin: 0; padding: 40px 16px; background: #f3f4f6; color: #1f2937; font-family: system-ui, sans-serif; }
                .invoice { max-width: 760px; margin: auto; padding: 44px; background: white; border-radius: 12px; box-shadow: 0 8px 30px #1111; }
                .top, .customer, .totals { display: flex; justify-content: space-between; gap: 24px; }
                .top { align-items: flex-start; border-bottom: 1px solid #e5e7eb; padding-bottom: 28px; }
                h1 { margin: 0; color: #5c6ac4; font-size: 32px; }
                h2 { margin: 0 0 8px; font-size: 16px; }
                p { margin: 5px 0; color: #6b7280; }
                .meta { text-align: right; }
                .customer { padding: 28px 0; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 13px 8px; border-bottom: 1px solid #e5e7eb; text-align: left; }
                th { color: #6b7280; font-size: 12px; text-transform: uppercase; }
                .number { text-align: right; white-space: nowrap; }
                .totals { justify-content: flex-end; padding-top: 20px; }
                .totals table { width: 260px; }
                .totals td { border: 0; padding: 6px 0; }
                .grand-total { font-size: 20px; font-weight: 700; color: #5c6ac4; }
                .status { display: inline-block; margin-top: 24px; padding: 7px 12px; border-radius: 20px; background: #fff7ed; color: #c2410c; font-size: 14px; }
                .download { margin-bottom: 24px; padding: 10px 16px; border: 0; border-radius: 6px; background: #5c6ac4; color: white; font: inherit; cursor: pointer; }
                @media print {
                  body { padding: 0; background: white; }
                  .invoice { max-width: none; padding: 0; box-shadow: none; }
                  .download { display: none; }
                }
                @media (max-width: 560px) { body { padding: 16px 10px; } .invoice { padding: 24px 18px; } .top { gap: 12px; } h1 { font-size: 26px; } }
              </style>
            </head>
            <body>
              <main class="invoice">
                <button class="download" onclick="window.print()">Download / Print invoice</button>
                <header class="top">
                  <div>
                    <h1>INVOICE</h1>
                    <p>Acme Studio</p>
                    <p>hello@acme.example</p>
                  </div>
                  <div class="meta">
                    <h2># INV-1001</h2>
                    <p>Issued: Sep 26, 2026</p>
                    <p>Due: Oct 10, 2026</p>
                  </div>
                </header>
                <section class="customer">
                  <div>
                    <h2>Bill to</h2>
                    <p>Jordan Lee</p>
                    <p>jordan@example.com</p>
                  </div>
                </section>
                <table>
                  <thead><tr><th>Description</th><th class="number">Qty</th><th class="number">Price</th><th class="number">Amount</th></tr></thead>
                  <tbody>
                    <tr><td>Website design</td><td class="number">1</td><td class="number">$1,200.00</td><td class="number">$1,200.00</td></tr>
                    <tr><td>Hosting</td><td class="number">2</td><td class="number">$25.00</td><td class="number">$50.00</td></tr>
                  </tbody>
                </table>
                <section class="totals">
                  <table>
                    <tr><td>Subtotal</td><td class="number">$1,250.00</td></tr>
                    <tr><td>Tax (8%)</td><td class="number">$100.00</td></tr>
                    <tr class="grand-total"><td>Total</td><td class="number">$1,350.00</td></tr>
                  </table>
                </section>
                <span class="status">Awaiting payment</span>
              </main>
            </body>
            </html>
            """;
    }

    @GetMapping("/api/hello")
    public Map<String, String> hello() {
        return Map.of("message", "Hello, World!");
    }
}
