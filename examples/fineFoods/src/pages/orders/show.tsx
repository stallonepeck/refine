import {
    Row,
    Col,
    useShow,
    IResourceComponentsProps,
    useTranslate,
    Button,
    Icons,
    Steps,
    PageHeader,
    Grid,
    useUpdate,
    Space,
    Avatar,
    Typography,
    Card,
    Table,
    List,
    Skeleton,
} from "@pankod/refine";
import dayjs from "dayjs";

import { IEvent, IOrder, IProduct } from "interfaces";
import { ReactNode } from "react";

import "./style.css";

const { useBreakpoint } = Grid;
const { Text } = Typography;

export const OrderShow: React.FC<IResourceComponentsProps> = () => {
    const t = useTranslate();
    const screens = useBreakpoint();
    const { queryResult } = useShow<IOrder>();
    const { data } = queryResult;
    const { mutate } = useUpdate();
    const record = data?.data;

    console.log("record", record);

    const currentBreakPoints = Object.entries(screens)
        .filter((screen) => !!screen[1])
        .map((screen) => screen[0]);

    const renderOrderSteps = () => {
        const notFinishedCurrentStep = (event: IEvent, index: number) =>
            event.status !== "Cancelled" &&
            event.status !== "Delivered" &&
            record?.events.findIndex(
                (el) => el.status === record?.status?.text,
            ) === index;

        const stepStatus = (event: IEvent, index: number) => {
            if (!event.date) return "wait";
            if (event.status === "Cancelled") return "error";
            if (notFinishedCurrentStep(event, index)) return "process";
            return "finish";
        };

        return (
            <PageHeader
                className="pageHeader"
                ghost={false}
                onBack={() => window.history.back()}
                title={t("orders:fields.orderID")}
                subTitle={`#${record?.orderNumber ?? ""}`}
                extra={[
                    <Button
                        disabled={record?.status.text !== "Pending"}
                        key="accept"
                        icon={<Icons.CheckCircleOutlined />}
                        type="primary"
                        onClick={() => {
                            if (record) {
                                mutate({
                                    resource: "orders",
                                    id: record?.id.toString(),
                                    values: {
                                        status: {
                                            id: 2,
                                            text: "Ready",
                                        },
                                    },
                                });
                            }
                        }}
                    >
                        {t("common:buttons.accept")}
                    </Button>,
                    <Button
                        disabled={record?.status.text === "Delivered"}
                        key="reject"
                        danger
                        icon={<Icons.CloseCircleOutlined />}
                        onClick={() => {
                            if (record) {
                                mutate({
                                    resource: "orders",
                                    id: record?.id.toString(),
                                    values: {
                                        status: {
                                            id: 5,
                                            text: "Cancelled",
                                        },
                                    },
                                });
                            }
                        }}
                    >
                        {t("common:buttons.reject")}
                    </Button>,
                ]}
            >
                <Steps
                    direction={
                        currentBreakPoints.includes("lg")
                            ? "horizontal"
                            : "vertical"
                    }
                    current={record?.events.findIndex(
                        (el) => el.status === record?.status?.text,
                    )}
                >
                    {record?.events.map((event: IEvent, index: number) => (
                        <Steps.Step
                            status={stepStatus(event, index)}
                            key={index}
                            title={event.status}
                            icon={
                                notFinishedCurrentStep(event, index) && (
                                    <Icons.LoadingOutlined />
                                )
                            }
                            description={
                                event.date && dayjs(event.date).format("L LT")
                            }
                        />
                    ))}
                </Steps>
                {!record && <Skeleton paragraph={{ rows: 1 }} />}
            </PageHeader>
        );
    };

    const courierInfoBox = (text: string, icon: ReactNode, value?: string) => (
        <div className="courier-infoBox">
            {icon}
            <div className="text">
                <Text style={{ color: "#ffffff" }}>{text.toUpperCase()}</Text>
                <Text style={{ color: "#ffffff" }}>{value}</Text>
            </div>
        </div>
    );

    const renderCourierInfo = () => (
        <Card>
            <Row justify="center">
                <Col xl={12} lg={10}>
                    <div className="courier">
                        <Avatar
                            size={108}
                            src={record?.courier.avatar[0].url}
                        />
                        <div className="info-text">
                            <Text style={{ fontSize: 16 }}>COURIER</Text>
                            <Text
                                style={{
                                    fontSize: 22,
                                    fontWeight: 800,
                                }}
                            >
                                {record?.courier.name} {record?.courier.surname}
                            </Text>
                            <Text>ID #{record?.courier.id}</Text>
                        </div>
                    </div>
                </Col>

                <Col xl={12} lg={14} md={24} className="courier-box-container">
                    {courierInfoBox(
                        t("orders:courier.phone"),
                        <Icons.MobileOutlined
                            className="mobile"
                            style={{ color: "#ffff", fontSize: 32 }}
                        />,
                        record?.courier.gsm,
                    )}
                    {courierInfoBox(
                        t("orders:courier.deliveryTime"),
                        <img
                            className="delivery-img"
                            src="/images/bike-white.svg"
                        />,
                        "15:05",
                    )}
                </Col>
            </Row>
        </Card>
    );

    const renderDeliverables = () => (
        <List
            pageHeaderProps={{ style: { marginTop: 20 } }}
            title={
                <Text style={{ fontSize: 22, fontWeight: 800 }}>
                    Deliverables
                </Text>
            }
        >
            <Table
                pagination={false}
                scroll={{ x: true }}
                dataSource={record?.products}
                footer={(_data) => (
                    <div className="product-footer">
                        <Text>MAIN TOTAL</Text>
                        <Text>{record?.amount}$</Text>
                    </div>
                )}
            >
                <Table.Column<IProduct>
                    defaultSortOrder="descend"
                    sorter={(a: IProduct, b: IProduct) =>
                        a.name > b.name ? 1 : -1
                    }
                    title="Items"
                    dataIndex="name"
                    render={(value, record) => (
                        <div className="product">
                            <Avatar
                                size={{
                                    md: 60,
                                    lg: 108,
                                    xl: 108,
                                    xxl: 108,
                                }}
                                src={record.images[0].url}
                            />
                            <div className="product-text">
                                <Text style={{ fontSize: 22, fontWeight: 800 }}>
                                    {value}
                                </Text>
                                <Text>#{record.id}</Text>
                            </div>
                        </div>
                    )}
                />
                <Table.Column
                    title="Qty"
                    dataIndex="quantity"
                    render={() => (
                        <Text style={{ fontWeight: 800 }}>{"1x"}</Text>
                    )}
                />

                <Table.Column
                    defaultSortOrder="descend"
                    sorter={(a: IProduct, b: IProduct) => a.price - b.price}
                    title="Price"
                    dataIndex="price"
                    render={(value) => (
                        <Text style={{ fontWeight: 800 }}>{value}</Text>
                    )}
                />
                <Table.Column
                    defaultSortOrder="descend"
                    sorter={(a: IProduct, b: IProduct) => a.price - b.price}
                    title="Total"
                    dataIndex="price"
                    render={(value) => (
                        <Text style={{ fontWeight: 800 }}>{value}</Text>
                    )}
                />
            </Table>
        </List>
    );

    return (
        <Row gutter={[16, 16]}>
            <Col>
                <Space size={20} direction="vertical">
                    {renderOrderSteps()}
                    <img width="100%" src="/images/map.png" />
                    {renderCourierInfo()}
                </Space>
                {renderDeliverables()}
            </Col>
        </Row>
    );
};
