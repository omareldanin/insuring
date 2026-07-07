import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "info@bfibrokerage.com",
      pass: "ekdup7Machimomfod#",
    },
  });

  async sendCompanyDocumentEmail(
    companyEmail: string,
    data: {
      documentId: number;
      price: number;
      finalPrice: number;
      carYear: string;
      idImage: string;
      carLicence: string;
      driveLicence: string;
    },
  ) {
    return this.transporter.sendMail({
      from: `"Insurify" <${process.env.MAIL_USER}>`,
      to: companyEmail,
      subject: `New Car Insurance Document #${data.documentId}`,
      html: `
        <h2>New Insurance Request</h2>

        <p><b>Document ID:</b> ${data.documentId}</p>
        <p><b>Car Year:</b> ${data.carYear}</p>
        <p><b>Price:</b> ${data.price}</p>
        <p><b>Final Price:</b> ${data.finalPrice}</p>

        <h3>Documents</h3>

    <h3>National Id Image</h3>
        <img src="cid:idImage" width="300"/>

        <p>Car Licence:</p>
        <img src="cid:carLicence" width="300"/>

        <p>Driver Licence:</p>
        <img src="cid:driveLicence" width="300"/>
      `,
      attachments: [
        {
          filename: "id.jpg",
          path: data.idImage,
          cid: "idImage",
        },
        {
          filename: "car-licence.jpg",
          path: data.carLicence,
          cid: "carLicence",
        },
        {
          filename: "driver-licence.jpg",
          path: data.driveLicence,
          cid: "driveLicence",
        },
      ],
    });
  }

  async sendCompanyRefundDocumentEmail(
    companyEmail: string,
    data: {
      documentId: string;
      carNumber: string;
      description: string;
      idImage: string;
      carLicence: string;
      driveLicence: string;
      accidentDate?: string;
      clientName?: string;
      clientPhone?: string;
      companyName?: string;
    },
  ) {
    const {
      documentId,
      carNumber,
      description,
      idImage,
      carLicence,
      driveLicence,
      accidentDate,
      clientName,
      clientPhone,
      companyName,
    } = data;

    const formattedDate = accidentDate
      ? new Date(accidentDate).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : new Date().toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        });

    const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>New Refund Request</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#121E2C;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                   style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(90deg,#1c46a2,#31e5b7);padding:24px;text-align:center;color:#ffffff;">
                  <h1 style="margin:0;font-size:22px;font-weight:600;">New Refund Request</h1>
                  <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">
                    A client has submitted a refund request after a car accident.
                  </p>
                </td>
              </tr>

              <!-- Summary card -->
              <tr>
                <td style="padding:24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                         style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:16px;">
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:4px 0;width:150px;">Document ID</td>
                      <td style="font-size:14px;font-weight:600;padding:4px 0;">#${documentId}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:4px 0;">Car number</td>
                      <td style="font-size:14px;font-weight:600;padding:4px 0;">${carNumber}</td>
                    </tr>
                    ${
                      companyName
                        ? `<tr>
                             <td style="font-size:13px;color:#6b7280;padding:4px 0;">Insurance company</td>
                             <td style="font-size:14px;font-weight:600;padding:4px 0;">${companyName}</td>
                           </tr>`
                        : ""
                    }
                    ${
                      clientName
                        ? `<tr>
                             <td style="font-size:13px;color:#6b7280;padding:4px 0;">Client</td>
                             <td style="font-size:14px;font-weight:600;padding:4px 0;">${clientName}</td>
                           </tr>`
                        : ""
                    }
                    ${
                      clientPhone
                        ? `<tr>
                             <td style="font-size:13px;color:#6b7280;padding:4px 0;">Phone</td>
                             <td style="font-size:14px;font-weight:600;padding:4px 0;">
                               <a href="tel:${clientPhone}" style="color:#1c46a2;text-decoration:none;">${clientPhone}</a>
                             </td>
                           </tr>`
                        : ""
                    }
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:4px 0;">Submitted at</td>
                      <td style="font-size:14px;font-weight:600;padding:4px 0;">${formattedDate}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Accident description -->
              <tr>
                <td style="padding:0 24px 24px;">
                  <h2 style="margin:0 0 8px;font-size:16px;color:#121E2C;">Accident description</h2>
                  <div style="background:#fff7ed;border:1px solid #fed7aa;border-left:4px solid #f97316;
                              border-radius:8px;padding:14px;font-size:14px;line-height:1.6;color:#7c2d12;white-space:pre-wrap;">
                    ${description || "No description provided."}
                  </div>
                </td>
              </tr>

              <!-- Attached documents -->
              <tr>
                <td style="padding:0 24px 24px;">
                  <h2 style="margin:0 0 12px;font-size:16px;color:#121E2C;">Attached documents</h2>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:8px;width:33.33%;vertical-align:top;">
                        <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#ffffff;">
                          <div style="background:#f3f4f6;padding:8px 10px;font-size:12px;color:#374151;font-weight:600;">
                            National ID
                          </div>
                          <img src="cid:idImage" alt="National ID"
                               style="display:block;width:100%;height:auto;" />
                        </div>
                      </td>
                      <td style="padding:8px;width:33.33%;vertical-align:top;">
                        <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#ffffff;">
                          <div style="background:#f3f4f6;padding:8px 10px;font-size:12px;color:#374151;font-weight:600;">
                            Car licence
                          </div>
                          <img src="cid:carLicence" alt="Car licence"
                               style="display:block;width:100%;height:auto;" />
                        </div>
                      </td>
                      <td style="padding:8px;width:33.33%;vertical-align:top;">
                        <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#ffffff;">
                          <div style="background:#f3f4f6;padding:8px 10px;font-size:12px;color:#374151;font-weight:600;">
                            Driver licence
                          </div>
                          <img src="cid:driveLicence" alt="Driver licence"
                               style="display:block;width:100%;height:auto;" />
                        </div>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:12px 0 0;font-size:12px;color:#6b7280;">
                    All documents are also included as file attachments to this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:16px 24px;border-top:1px solid #e5e7eb;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#6b7280;">
                    This message was sent automatically by <b style="color:#1c46a2;">Insurify</b>.
                    Please review the request and respond directly to the client.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

    const text = [
      `New Refund Request`,
      ``,
      `Document ID: #${documentId}`,
      `Car number: ${carNumber}`,
      companyName && `Insurance company: ${companyName}`,
      clientName && `Client: ${clientName}`,
      clientPhone && `Phone: ${clientPhone}`,
      `Submitted at: ${formattedDate}`,
      ``,
      `Accident description:`,
      description || "No description provided.",
      ``,
      `Attached documents: National ID, Car licence, Driver licence.`,
    ]
      .filter(Boolean)
      .join("\n");

    return this.transporter.sendMail({
      from: `"Insurify" <${process.env.MAIL_USER}>`,
      to: companyEmail,
      subject: `New refund request — document #${documentId} (car ${carNumber})`,
      html,
      text,
      attachments: [
        {
          filename: "national-id.jpg",
          path: idImage,
          cid: "idImage",
        },
        {
          filename: "car-licence.jpg",
          path: carLicence,
          cid: "carLicence",
        },
        {
          filename: "driver-licence.jpg",
          path: driveLicence,
          cid: "driveLicence",
        },
      ],
    });
  }

  async sendLifeDocumentEmail(
    companyEmail: string,
    data: {
      documentId: number;
      price: number;
      finalPrice: number;
      idImage: string;
    },
  ) {
    return this.transporter.sendMail({
      from: `"Insurify" <${process.env.MAIL_USER}>`,
      to: companyEmail,
      subject: `New Life Insurance Request #${data.documentId}`,
      html: `
      <h2>New Life Insurance Request</h2>

      <p><b>Document ID:</b> ${data.documentId}</p>
      <p><b>Price:</b> ${data.price}</p>
      <p><b>Final Price:</b> ${data.finalPrice}</p>

      <h3>National Id Image</h3>
      <img src="cid:idImage" width="300"/>
    `,
      attachments: [
        {
          filename: "id.jpg",
          path: data.idImage,
          cid: "idImage",
        },
      ],
    });
  }

  async sendIndividualHealthDocumentEmail(
    companyEmail: string,
    data: {
      documentId: number;
      age: number;
      gender: string;
      price: number;
      idImage: string;
      avatar?: string;
    },
  ) {
    return this.transporter.sendMail({
      from: `"Insurify" <${process.env.MAIL_USER}>`,
      to: companyEmail,
      subject: `New Individual Health Insurance Request #${data.documentId}`,
      html: `
      <h2>New Individual Health Insurance Request</h2>

      <p><b>Document ID:</b> ${data.documentId}</p>
      <p><b>Age:</b> ${data.age}</p>
      <p><b>Gender:</b> ${data.gender}</p>
      <p><b>Price:</b> ${data.price}</p>

      <h3>National Id Image</h3>
      <img src="cid:idImage" width="300"/>

      ${data.avatar ? `<h3>Client Image</h3><img src="cid:avatar" width="300"/>` : ""}
    `,
      attachments: [
        {
          filename: "id.jpg",
          path: data.idImage,
          cid: "idImage",
        },
        ...(data.avatar
          ? [
              {
                filename: "avatar.jpg",
                path: data.avatar,
                cid: "avatar",
              },
            ]
          : []),
      ],
    });
  }

  async sendGroupHealthDocumentEmail(
    companyEmail: string,
    data: {
      documentId: number;
      totalPrice: number;
      groupName?: string;
      members: {
        age: number;
        gender: string;
        price: number;
        idImage?: string;
        avatar?: string;
      }[];
    },
  ) {
    const membersHtml = data.members
      .map(
        (m, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${m.age}</td>
        <td>${m.gender}</td>
        <td>${m.price}</td>
      </tr>
    `,
      )
      .join("");

    return this.transporter.sendMail({
      from: `"Insurify" <${process.env.MAIL_USER}>`,
      to: companyEmail,
      subject: `New Group Health Insurance Request #${data.documentId}`,
      html: `
      <h2>New Group Health Insurance Request</h2>

      <p><b>Document ID:</b> ${data.documentId}</p>
      <p><b>Group Name:</b> ${data.groupName ?? "N/A"}</p>
      <p><b>Total Price:</b> ${data.totalPrice}</p>

      <h3>Members</h3>

      <table border="1" cellpadding="5">
        <tr>
          <th>#</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Price</th>
        </tr>

        ${membersHtml}
      </table>
    `,
    });
  }
}
