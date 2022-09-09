import * as path from "path";
import * as Page from "../pageobjects/page";
import { hashFile } from "../util/hashFile";
import { waitForFileExists } from "../util/waitForFileExists";

async function testTransferSuccess(fileName: string, timeout?: number) {
  const originalFilePath = path.join("/usr/src/app/test/files/", fileName);
  const receivedFilePath = path.join(
    global.downloadDir,
    path.basename(fileName)
  );

  await Page.open();
  const _sendWindow = await browser.getWindowHandle();
  await Page.uploadFiles(originalFilePath);
  const input = await $("input[readonly='']");
  const codeUrl = await input.getValue();
  const _receiveWindow = await browser.newWindow(codeUrl);
  await browser.waitUntil(() => $("button*=Download").isExisting());
  await (await $("button*=Download")).click();
  await browser.call(() =>
    waitForFileExists(receivedFilePath, timeout || 60000)
  );
  await browser.waitUntil(async () => {
    const originalHash = await hashFile(originalFilePath);
    const receivedHash = await hashFile(receivedFilePath);
    return originalHash === receivedHash;
  });
}

async function testTransferFailure(fileName: string, timeout?: number) {
  const originalFilePath = path.join("/usr/src/app/test/files/", fileName);
  const receivedFilePath = path.join(
    global.downloadDir,
    path.basename(fileName)
  );

  await Page.open();
  const _sendWindow = await browser.getWindowHandle();
  await Page.uploadFiles(originalFilePath);
  const content = await $("body");
  await expect(content).toHaveTextContaining("Large file sizes: coming soon");
}

describe("Send flow", () => {

  describe("when uploading a file with the size of 300MB", () => {
    it.skip("will tell the user that the file is too large", async () => {
      await testTransferFailure("sizes/300MB");
    });
  });

  describe("when uploading a file with the size of 4.2GB", () => {
    it.skip("will tell the user that the file is too large", async function () {
      this.timeout(120000);
      await testTransferFailure("sizes/4.2GB");
    });
  });

  describe("when uploading a file with the size of 4.3GB", () => {
    it.skip("will tell the user that the file is too large", async function () {
      this.timeout(120000);
      await testTransferFailure("sizes/4.3GB");
    });
  });

});
