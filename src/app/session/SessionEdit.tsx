import * as React from "react";
import { FormEvent } from "react";
import { Alert, Button, Card, Form, message } from "antd";
import { observer } from "mobx-react";
import { SessionManagement } from "./SessionManagement";
import { FormComponentProps } from "antd/lib/form";
import { Link, Redirect } from "react-router-dom";
import { IReactionDisposer, observable, reaction, toJS } from "mobx";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps
} from "react-intl";

import {
  instance,
  MainStoreInjected,
  injectMainStore
} from "@cuba-platform/react-core";

import {
  Field,
  withLocalizedForm,
  extractServerValidationErrors,
  constructFieldsWithErrors,
  clearFieldErrors,
  MultilineText,
  Spinner
} from "@cuba-platform/react-ui";

import "../../app/App.css";

import { Session } from "../../cuba/entities/sessionplanner_Session";

type Props = FormComponentProps & EditorProps & MainStoreInjected;

type EditorProps = {
  entityId: string;
};

@injectMainStore
@observer
class SessionEditComponent extends React.Component<
  Props & WrappedComponentProps
> {
  dataInstance = instance<Session>(Session.NAME, {
    view: "_local",
    loadImmediately: false
  });

  @observable updated = false;
  @observable formRef: React.RefObject<Form> = React.createRef();
  reactionDisposers: IReactionDisposer[] = [];

  fields = ["topic", "startDate", "duration", "description"];

  @observable globalErrors: string[] = [];

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        message.error(
          this.props.intl.formatMessage({
            id: "management.editor.validationError"
          })
        );
        return;
      }
      this.dataInstance
        .update(
          this.props.form.getFieldsValue(this.fields),
          this.isNewEntity() ? "create" : "edit"
        )
        .then(() => {
          message.success(
            this.props.intl.formatMessage({ id: "management.editor.success" })
          );
          this.updated = true;
        })
        .catch((e: any) => {
          if (e.response && typeof e.response.json === "function") {
            e.response.json().then((response: any) => {
              clearFieldErrors(this.props.form);
              const {
                globalErrors,
                fieldErrors
              } = extractServerValidationErrors(response);
              this.globalErrors = globalErrors;
              if (fieldErrors.size > 0) {
                this.props.form.setFields(
                  constructFieldsWithErrors(fieldErrors, this.props.form)
                );
              }

              if (fieldErrors.size > 0 || globalErrors.length > 0) {
                message.error(
                  this.props.intl.formatMessage({
                    id: "management.editor.validationError"
                  })
                );
              } else {
                message.error(
                  this.props.intl.formatMessage({
                    id: "management.editor.error"
                  })
                );
              }
            });
          } else {
            message.error(
              this.props.intl.formatMessage({ id: "management.editor.error" })
            );
          }
        });
    });
  };

  isNewEntity = () => {
    return this.props.entityId === SessionManagement.NEW_SUBPATH;
  };

  render() {
    if (this.updated) {
      return <Redirect to={SessionManagement.PATH} />;
    }

    const { status, lastError, load } = this.dataInstance;
    const { mainStore, entityId } = this.props;
    if (mainStore == null || !mainStore.isEntityDataLoaded()) {
      return <Spinner />;
    }

    // do not stop on "COMMIT_ERROR" - it could be bean validation, so we should show fields with errors
    if (status === "ERROR" && lastError === "LOAD_ERROR") {
      return (
        <>
          <FormattedMessage id="common.requestFailed" />.
          <br />
          <br />
          <Button htmlType="button" onClick={() => load(entityId)}>
            <FormattedMessage id="common.retry" />
          </Button>
        </>
      );
    }

    return (
      <Card className="narrow-layout">
        <Form onSubmit={this.handleSubmit} layout="vertical" ref={this.formRef}>
          <Field
            entityName={Session.NAME}
            propertyName="topic"
            form={this.props.form}
            formItemOpts={{ style: { marginBottom: "12px" } }}
            getFieldDecoratorOpts={{
              rules: [{ required: true }]
            }}
          />

          <Field
            entityName={Session.NAME}
            propertyName="startDate"
            form={this.props.form}
            formItemOpts={{ style: { marginBottom: "12px" } }}
            getFieldDecoratorOpts={{
              rules: [{ required: true }]
            }}
          />

          <Field
            entityName={Session.NAME}
            propertyName="duration"
            form={this.props.form}
            formItemOpts={{ style: { marginBottom: "12px" } }}
            getFieldDecoratorOpts={{
              rules: [{ required: true }]
            }}
          />

          <Field
            entityName={Session.NAME}
            propertyName="description"
            form={this.props.form}
            formItemOpts={{ style: { marginBottom: "12px" } }}
            getFieldDecoratorOpts={{}}
          />

          {this.globalErrors.length > 0 && (
            <Alert
              message={<MultilineText lines={toJS(this.globalErrors)} />}
              type="error"
              style={{ marginBottom: "24px" }}
            />
          )}

          <Form.Item style={{ textAlign: "center" }}>
            <Link to={SessionManagement.PATH}>
              <Button htmlType="button">
                <FormattedMessage id="common.cancel" />
              </Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              disabled={status !== "DONE"}
              loading={status === "LOADING"}
              style={{ marginLeft: "8px" }}
            >
              <FormattedMessage id="common.submit" />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }

  componentDidMount() {
    if (this.isNewEntity()) {
      this.dataInstance.setItem(new Session());
    } else {
      this.dataInstance.load(this.props.entityId);
    }

    this.reactionDisposers.push(
      reaction(
        () => this.dataInstance.status,
        () => {
          const { intl } = this.props;
          if (this.dataInstance.lastError != null) {
            message.error(intl.formatMessage({ id: "common.requestFailed" }));
          }
        }
      )
    );

    this.reactionDisposers.push(
      reaction(
        () => this.formRef.current,
        (formRefCurrent, formRefReaction) => {
          if (formRefCurrent != null) {
            // The Form has been successfully created.
            // It is now safe to set values on Form fields.
            this.reactionDisposers.push(
              reaction(
                () => this.dataInstance.item,
                () => {
                  this.props.form.setFieldsValue(
                    this.dataInstance.getFieldValues(this.fields)
                  );
                },
                { fireImmediately: true }
              )
            );
            formRefReaction.dispose();
          }
        },
        { fireImmediately: true }
      )
    );
  }

  componentWillUnmount() {
    this.reactionDisposers.forEach(dispose => dispose());
  }
}

export default injectIntl(
  withLocalizedForm<EditorProps>({
    onValuesChange: (props: any, changedValues: any) => {
      // Reset server-side errors when field is edited
      Object.keys(changedValues).forEach((fieldName: string) => {
        props.form.setFields({
          [fieldName]: {
            value: changedValues[fieldName]
          }
        });
      });
    }
  })(SessionEditComponent)
);
