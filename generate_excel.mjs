import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateProfessionalWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Nexus Digital / khongtienmat.vn';
  workbook.lastModifiedBy = 'Nexus Digital Operation Team';
  workbook.created = new Date();
  workbook.modified = new Date();

  // -------------------------------------------------------------
  // TAB 1: Leads (Operational Tab for Direct Google Sheets Import)
  // -------------------------------------------------------------
  const leadsSheet = workbook.addWorksheet('Leads', {
    views: [
      { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2', showGridLines: true }
    ],
    properties: {
      tabColor: { argb: 'FF1E3A8A' } // Navy Blue
    }
  });

  // 12 Columns Definition
  const columns = [
    { header: 'Lead ID', key: 'lead_id', width: 22 },
    { header: 'Thời gian', key: 'created_at', width: 22 },
    { header: 'Sản phẩm quan tâm', key: 'product', width: 34 },
    { header: 'Họ và tên', key: 'full_name', width: 24 },
    { header: 'Số điện thoại', key: 'phone', width: 18 },
    { header: 'Tên đơn vị kinh doanh', key: 'store_name', width: 30 },
    { header: 'Địa chỉ kinh doanh', key: 'store_address', width: 44 },
    { header: 'Ngôn ngữ', key: 'language', width: 14 },
    { header: 'Nguồn', key: 'source', width: 18 },
    { header: 'URL', key: 'url', width: 40 },
    { header: 'Trạng thái gửi Zalo', key: 'zalo_status', width: 22 },
    { header: 'Ghi chú lỗi', key: 'zalo_error', width: 22 }
  ];

  leadsSheet.columns = columns;

  // Format Header Row (Row 1) - Classic Executive Navy & Slate
  const headerRow = leadsSheet.getRow(1);
  headerRow.height = 32;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: 'Segoe UI',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // Deep Corporate Navy
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0F172A' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF3B82F6' } },
      right: { style: 'thin', color: { argb: 'FF3B82F6' } }
    };
  });

  // Enable AutoFilter on row 1
  leadsSheet.autoFilter = {
    from: 'A1',
    to: 'L1'
  };

  // Sample data rows to guide team
  const sampleLeads = [
    {
      lead_id: 'KTM-20260923-8A2F',
      created_at: '2026-09-23 09:15:20',
      product: 'VietQR Pay (Bảng mica để bàn)',
      full_name: 'Nguyễn Văn An',
      phone: '0912345678',
      store_name: 'Cà phê An Nhiên',
      store_address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
      language: 'vi',
      source: 'khongtienmat.vn',
      url: 'https://danhhuynh-stack.github.io/khongtienmat-landing/',
      zalo_status: 'Đã gửi',
      zalo_error: ''
    },
    {
      lead_id: 'KTM-20260923-9C1D',
      created_at: '2026-09-23 09:42:05',
      product: 'Loa thông báo giao dịch',
      full_name: 'Trần Thị Bích Ngọc',
      phone: '0988765432',
      store_name: 'Trà Sữa Mộc Trà',
      store_address: '45 Lê Lợi, Phường Vĩnh Ninh, TP. Huế',
      language: 'vi',
      source: 'khongtienmat.vn',
      url: 'https://danhhuynh-stack.github.io/khongtienmat-landing/',
      zalo_status: 'Đã gửi',
      zalo_error: ''
    },
    {
      lead_id: 'KTM-20260923-3E7B',
      created_at: '2026-09-23 10:05:12',
      product: 'Máy POS thanh toán',
      full_name: 'Lê Hoàng Nam',
      phone: '0903112233',
      store_name: 'Nhà hàng Biển Đông',
      store_address: '88 Trần Phú, Phường Lộc Thọ, TP. Nha Trang',
      language: 'vi',
      source: 'khongtienmat.vn',
      url: 'https://danhhuynh-stack.github.io/khongtienmat-landing/',
      zalo_status: 'Đã gửi',
      zalo_error: ''
    },
    {
      lead_id: 'KTM-20260923-4F8A',
      created_at: '2026-09-23 10:20:45',
      product: 'Trọn bộ giải pháp (Được tư vấn tất cả)',
      full_name: 'Phạm Minh Đức',
      phone: '0977889900',
      store_name: 'Siêu thị Tiện Lợi Đức Phát',
      store_address: '210 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội',
      language: 'vi',
      source: 'khongtienmat.vn',
      url: 'https://danhhuynh-stack.github.io/khongtienmat-landing/',
      zalo_status: 'Đã gửi',
      zalo_error: ''
    },
    {
      lead_id: 'KTM-20260923-1A9E',
      created_at: '2026-09-23 10:35:18',
      product: 'Phần mềm bán hàng',
      full_name: 'Vũ Thanh Hằng',
      phone: '0934567890',
      store_name: 'Hằng Fashion Boutique',
      store_address: '15 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
      language: 'vi',
      source: 'khongtienmat.vn',
      url: 'https://danhhuynh-stack.github.io/khongtienmat-landing/',
      zalo_status: 'Đã gửi',
      zalo_error: ''
    }
  ];

  sampleLeads.forEach((item, index) => {
    const row = leadsSheet.addRow(item);
    row.height = 24;
    const isEven = index % 2 === 1;

    // Apply Zebra striping and borders
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = {
        name: 'Segoe UI',
        size: 10,
        color: { argb: 'FF1E293B' }
      };

      // Zebra background
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFF8FAFC' : 'FFFFFFFF' }
      };

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Specific column alignments & formats
      // Col 1: Lead ID (Center, Text)
      if (colNumber === 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = '@';
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1E3A8A' } };
      }
      // Col 2: Thời gian (Center)
      else if (colNumber === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
      // Col 3: Sản phẩm (Left)
      else if (colNumber === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
      // Col 4: Họ và tên (Left, bold)
      else if (colNumber === 4) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      }
      // Col 5: Số điện thoại (Center, Text with leading 0)
      else if (colNumber === 5) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = '@';
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF2563EB' } };
      }
      // Col 6: Tên cửa hàng (Left)
      else if (colNumber === 6) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
      // Col 7: Địa chỉ kinh doanh (Left, wrapText)
      else if (colNumber === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
      // Col 8: Ngôn ngữ (Center)
      else if (colNumber === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
      // Col 9: Nguồn (Center)
      else if (colNumber === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
      // Col 10: URL (Left)
      else if (colNumber === 10) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF64748B' } };
      }
      // Col 11: Trạng thái gửi Zalo (Tag Pill formatting)
      else if (colNumber === 11) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        const val = cell.value;
        if (val === 'Đã gửi') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Soft green
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF166534' } }; // Dark green
        } else if (val === 'Lỗi') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Soft red
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF991B1B' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Soft yellow
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF92400E' } };
        }
      }
      // Col 12: Ghi chú lỗi (Left)
      else if (colNumber === 12) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.font = { name: 'Segoe UI', size: 9, color: { argb: 'FFDC2626' } };
      }
    });
  });

  // -------------------------------------------------------------
  // TAB 2: HuongDan_SuDung (Executive Documentation & Setup)
  // -------------------------------------------------------------
  const guideSheet = workbook.addWorksheet('Hướng Dẫn Tích Hợp', {
    views: [{ showGridLines: true }],
    properties: {
      tabColor: { argb: 'FF0284C7' } // Sky Blue
    }
  });

  // Set column widths for guide sheet
  guideSheet.columns = [
    { width: 5 },  // A margin
    { width: 26 }, // B Field Name
    { width: 40 }, // C Description
    { width: 35 }, // D Notes / API Mapping
    { width: 20 }  // E Status
  ];

  // Title Banner
  guideSheet.mergeCells('B2:E2');
  const guideTitle = guideSheet.getCell('B2');
  guideTitle.value = 'BỘ GIẢI PHÁP THANH TOÁN KHONGTIENMAT.VN — BẢNG ĐỐI SOÁT LEAD';
  guideTitle.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  guideTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
  guideTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  guideSheet.getRow(2).height = 36;

  // Subtitle
  guideSheet.mergeCells('B3:E3');
  const guideSub = guideSheet.getCell('B3');
  guideSub.value = 'Chuẩn hóa dữ liệu nhận tự động từ Cloudflare Worker và đồng bộ thông báo Chatbot Zalo | Hotline: 0924.0934.61';
  guideSub.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF1E40AF' } };
  guideSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
  guideSub.alignment = { vertical: 'middle', horizontal: 'center' };
  guideSheet.getRow(3).height = 24;

  // Section Header 1
  guideSheet.getCell('B5').value = '1. DANH SÁCH 12 CỘT DỮ LIỆU CHUẨN TRÊN TAB "Leads"';
  guideSheet.getCell('B5').font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF0F172A' } };

  // Guide Table Header
  const guideHeaderRow = guideSheet.getRow(6);
  guideHeaderRow.height = 26;
  const guideHeaders = ['', 'Tên Cột (Header)', 'Mô Tả Dữ Liệu', 'Quy Cách & Nguồn Gửi', 'Định Dạng'];
  guideHeaders.forEach((h, idx) => {
    if (idx > 0) {
      const cell = guideHeaderRow.getCell(idx + 1);
      cell.value = h;
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  const columnsGuide = [
    ['Lead ID (Cột A)', 'Mã định danh duy nhất của lead', 'KTM-YYYYMMDD-XXXX (Tạo tự động)', 'Text (@)'],
    ['Thời gian (Cột B)', 'Thời điểm khách gửi form', 'Múi giờ Asia/Ho_Chi_Minh (YYYY-MM-DD HH:mm:ss)', 'Date/Time'],
    ['Sản phẩm quan tâm (Cột C)', 'Gói giải pháp khách lựa chọn', 'VietQR Pay / Loa / POS / Phần mềm / Trọn bộ', 'Text'],
    ['Họ và tên (Cột D)', 'Họ tên khách hàng đăng ký', 'Chuẩn hóa viết hoa, loại bỏ ký tự lạ', 'Text'],
    ['Số điện thoại (Cột E)', 'SĐT liên hệ của chủ quán/thu ngân', 'Chuẩn di động VN 10 chữ số (0xxxxxxxxx)', 'Text (Giữ số 0)'],
    ['Tên đơn vị kinh doanh (Cột F)', 'Tên quán ăn, cafe, shop, công ty', 'Nhập trực tiếp từ form khách hàng', 'Text'],
    ['Địa chỉ kinh doanh (Cột G)', 'Địa chỉ cửa hàng cần lắp đặt', 'Địa chỉ chi tiết phục vụ kinh doanh khảo sát', 'Text (Wrap)'],
    ['Ngôn ngữ (Cột H)', 'Ngôn ngữ website tại lúc gửi', 'vi (Tiếng Việt), en, zh, ko, th', 'Text'],
    ['Nguồn (Cột I)', 'Nguồn phát sinh lead', 'Cố định: khongtienmat.vn', 'Text'],
    ['URL (Cột J)', 'Link landing page tiếp nhận', 'URL đầy đủ trang đăng ký', 'URL'],
    ['Trạng thái gửi Zalo (Cột K)', 'Kết quả bắn webhook sang Zalo', 'Đã gửi / Lỗi / Đang chờ', 'Status Pill'],
    ['Ghi chú lỗi (Cột L)', 'Mã lỗi kỹ thuật (nếu Zalo lỗi)', 'HTTP_500, TIMEOUT (trống nếu OK)', 'Error Text']
  ];

  columnsGuide.forEach((row, i) => {
    const r = guideSheet.getRow(7 + i);
    r.height = 22;
    row.forEach((val, j) => {
      const c = r.getCell(2 + j);
      c.value = val;
      c.font = { name: 'Segoe UI', size: 9.5 };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 1 ? 'FFF8FAFC' : 'FFFFFFFF' } };
      c.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      if (j === 0) c.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF1E3A8A' } };
      if (j === 3) c.alignment = { horizontal: 'center' };
    });
  });

  // Section 2: Instructions
  const rowInst = 21;
  guideSheet.getCell(`B${rowInst}`).value = '2. HƯỚNG DẪN IMPORT VÀO GOOGLE SHEETS';
  guideSheet.getCell(`B${rowInst}`).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF0F172A' } };

  const instructions = [
    'Bước 1: Mở Google Drive (drive.google.com) -> Nhấn "+ Mới" -> Chọn "Google Trang tính" (Google Sheets).',
    'Bước 2: Vào Tệp (File) -> Nhập (Import) -> Chọn file "KhongTienMat_Leads_Template.xlsx" này.',
    'Bước 3: Chọn "Thay thế bảng tính" hoặc "Tạo bảng tính mới" -> Nhấn Nhập dữ liệu.',
    'Bước 4: Đảm bảo tab chứa 12 cột mang đúng tên: "Leads".',
    'Bước 5: Nhấn nút "Chia sẻ" (Share) ở góc trên bên phải -> Dán email Google Service Account với quyền "Người chỉnh sửa" (Editor).'
  ];

  instructions.forEach((txt, idx) => {
    const r = guideSheet.getRow(rowInst + 1 + idx);
    r.height = 20;
    guideSheet.mergeCells(`B${rowInst + 1 + idx}:E${rowInst + 1 + idx}`);
    const c = guideSheet.getCell(`B${rowInst + 1 + idx}`);
    c.value = txt;
    c.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF334155' } };
    c.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  const outputPath = path.join(__dirname, 'KhongTienMat_Leads_Template.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`[SUCCESS] Excel workbook generated at: ${outputPath}`);
}

generateProfessionalWorkbook().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
