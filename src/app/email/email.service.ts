import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
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
